/** @jsxImportSource @emotion/react */
// src/components/SeriesSideBar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useStudyStore } from "../stores/useStudyStore";
import { ensureCornerstoneReady } from "../lib/cornerstone";
import { fetchInstanceUrls } from "../api/dicom";
import { imageIdToThumbDataURL } from "../lib/thumb";
import { createImageIdsFromFiles } from "../lib/cornerstone"; // ✅ 프로젝트 유틸 사용 (로컬 파일 → imageIds)

type Props = {
  onSelect: (imageIds: string[]) => Promise<void> | void;
  // ✅ 로컬 파일 모드: 시리즈별 파일 묶음 (없으면 서버 모드로 동작)
  filesBySeries?: (File | Blob)[][];
};

const thumbCache = new Map<string, string>();

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const Thumb = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? "#4ea1ff" : "#1a2b45")};
  background: #0a1018; border-radius: 10px; padding: 6px;
  display: grid; gap: 6px; cursor: pointer;

  img{ width: 100%; height: 100px; object-fit: contain; border-radius: 6px; background:#0a0f16; }
  .skeleton{
    width: 100%; height: 100px; border-radius: 6px;
    background: linear-gradient(90deg, #0d131c 25%, #121a26 37%, #0d131c 63%);
    background-size: 400% 100%; animation: sh 1.2s ease-in-out infinite;
  }
  @keyframes sh{ 0%{background-position:100% 50%} 100%{background-position:0 50%} }
  .meta{ font-size: 11px; color:#b9d3ff; display:flex; justify-content:space-between; }
`;

type Item = {
  key: string;            // 로컬/서버 공통 식별자
  number?: number;
  desc?: string;
  count?: number;
  thumb?: string;
};

export default function SeriesSidebar({ onSelect, filesBySeries }: Props) {
  const { StudyList } = useStudyStore();

  const [active, setActive] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const jobIdRef = useRef(0);

  // ✅ 로컬/서버 모드 분기
  const isLocalMode = !!filesBySeries?.length;

  // ===== 서버 모드: StudyList → series 목록 뽑기 =====
  const serverSeries = useMemo(() => {
    const out: { uid: string; number?: number; desc?: string }[] = [];
    if (!isLocalMode) {
      for (const st of (StudyList ?? []) as any[]) {
        for (const se of st.series ?? []) {
          out.push({ uid: se.seriesInstanceUID, number: se.seriesNumber, desc: se.seriesDescription });
        }
      }
    }
    return out;
  }, [StudyList, isLocalMode]);
  
  // ✅ 의존성 안정화: “길이/uid”만으로 키 생성 → 잦은 재실행 방지
  const depsKey = useMemo(() => {
    if (isLocalMode) {
      const len = filesBySeries?.length ?? 0;
      const per = (filesBySeries ?? []).map(arr => Array.isArray(arr) ? arr.length : 0).join(",");
      return `local:${len}:${per}`;
    }
    return `server:${serverSeries.map(s => s.uid).join(",")}`;
  }, [isLocalMode, filesBySeries, serverSeries]);

  useEffect(() => {
    const myJob = jobIdRef.current;
    (async () => {
      await ensureCornerstoneReady();
      if (isLocalMode) {
        // ===== 로컬 모드: filesBySeries 기반으로 썸네일/카운트 구성 =====
        if (!filesBySeries?.length) return;
        setLoading(true);
        try {
          const tasks = (filesBySeries ?? []).map(async (files, i) => {
            const key = `local-${i}`;
            let thumb = thumbCache.get(key);
            if (!thumb) {
              const imageIds = createImageIdsFromFiles((files ?? []) as File[]);
              if (imageIds[0]) {
                try { thumb = await imageIdToThumbDataURL(imageIds[0], 160); } catch {}
                if (thumb) thumbCache.set(key, thumb);
              }
            }
            return {
              key,
              number: i + 1,
              desc: `Local Series ${i + 1}`,
              count: (files ?? []).length,
              thumb,
            } as Item;
          });
          const settled = await Promise.allSettled(tasks);
          if (jobIdRef.current !== myJob) return; // 최신 잡만 반영
          const next = settled.map(r => r.status === "fulfilled" ? r.value : undefined).filter(Boolean) as Item[];
          setItems(next);
        } finally {
          if (jobIdRef.current === myJob) setLoading(false);
        }
      } else {
        // ===== 서버 모드: 기존 로직 유지 =====
        if (!serverSeries.length) return;
        setLoading(true);
        try {
          const tasks = serverSeries.map(async (s) => {
            const key = s.uid;
            let thumb = thumbCache.get(key);
            let count: number | undefined = undefined;
            try {
              const urls = await fetchInstanceUrls(s.uid);
              count = urls?.length ?? 0;
              if (!thumb && urls?.length) {
                const first = urls[0]?.startsWith("wadouri:") ? urls[0] : `wadouri:${urls[0]}`;
                try { thumb = await imageIdToThumbDataURL(first, 160); } catch {}
                if (thumb) thumbCache.set(key, thumb);
              }
            } catch { /* ignore per-series fetch error */ }
            return { key, number: s.number, desc: s.desc, count, thumb } as Item;
          });
          const settled = await Promise.allSettled(tasks);
          if (jobIdRef.current !== myJob) return;
          const next = settled.map(r => r.status === "fulfilled" ? r.value : undefined).filter(Boolean) as Item[];
          setItems(next);
        } finally {
          if (jobIdRef.current === myJob) setLoading(false);
        }
      }
    })();
        return () => { /* 최신 잡만 반영할 것이므로 별도 stop 불필요 */ };
  }, [depsKey, isLocalMode]);

  const handleClick = async (key: string) => {
    setActive(key);
    if (isLocalMode) {
      // 로컬 모드: key → index
      const idx = Number(key.replace("local-", ""));
      const files = (filesBySeries?.[idx] ?? []) as File[];
      const imageIds = createImageIdsFromFiles(files);
      await onSelect(imageIds);
    } else {
      // 서버 모드: 기존처럼 uid → urls → imageIds
      const s = serverSeries.find((x) => x.uid === key);
      if (!s) return;
      const urls = await fetchInstanceUrls(s.uid);
      const imageIds = urls.map((u) => (u.startsWith("wadouri:") ? u : `wadouri:${u}`));
      await onSelect(imageIds);
    }
  };

  if (!isLocalMode && !serverSeries.length) {
    return <div style={{ opacity: 0.7, fontSize: 12 }}>불러온 시리즈가 없습니다.</div>;
  }
  if (isLocalMode && !filesBySeries?.length) {
    return <div style={{ opacity: 0.7, fontSize: 12 }}>로컬 시리즈 파일이 없습니다.</div>;
  }

  return (
    <Grid>
      {items.map((s) => (
        <Thumb key={s.key} onClick={() => handleClick(s.key)} $active={active === s.key} title={s.desc}>
          {s.thumb ? <img src={s.thumb} alt={s.desc || s.key} /> : <div className="skeleton" />}
          <div className="meta">
            <span>S{String(s.number ?? "").padStart(2, "0")}</span>
            <span>{s.count ?? (loading ? "..." : "-")}</span>
          </div>
        </Thumb>
      ))}
    </Grid>
  );
}
