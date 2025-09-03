/** @jsxImportSource @emotion/react */
// src/components/SeriesSideBar.tsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useStudyStore } from "../stores/useStudyStore";
import { useCornerstone } from "../stores/useCornerstone";
import { fetchInstanceUrls } from "../api/dicom";
import { imageIdToThumbDataURL } from "../lib/thumb";
import { createImageIdsFromFiles } from "../lib/cornerstone"; // ✅ 프로젝트 유틸 사용 (로컬 파일 → imageIds)

type Props = {
  onSelect: (imageIds: string[]) => Promise<void> | void;
  // ✅ 로컬 파일 모드: 시리즈별 파일 묶음 (없으면 서버 모드로 동작)
  filesBySeries?: (File | Blob)[][];
};

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
  const whenReady = useCornerstone((s) => s.whenReady);

  const [active, setActive] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    let stop = false;
    (async () => {
      setItems([]);
      if (isLocalMode) {
        // ===== 로컬 모드: filesBySeries 기반으로 썸네일/카운트 구성 =====
        if (!filesBySeries?.length) return;
        setLoading(true);
        try {
          await whenReady();
          const next: Item[] = [];
          for (let i = 0; i < filesBySeries.length; i++) {
            const files = filesBySeries[i] ?? [];
            const imageIds = createImageIdsFromFiles(files as File[]); // Cornerstone 권장
            let thumb: string | undefined = undefined;
            try {
              if (imageIds[0]) {
                thumb = await imageIdToThumbDataURL(imageIds[0], 160);
              }
            } catch {}
            if (stop) return;
            next.push({
              key: `local-${i}`,
              number: i + 1,
              desc: `Local Series ${i + 1}`,
              count: imageIds.length,
              thumb,
            });
          }
          if (!stop) setItems(next);
        } finally {
          if (!stop) setLoading(false);
        }
      } else {
        // ===== 서버 모드: 기존 로직 유지 =====
        if (!serverSeries.length) return;
        setLoading(true);
        try {
          await whenReady();
          const next: Item[] = [];
          for (const s of serverSeries) {
            try {
              const urls = await fetchInstanceUrls(s.uid);
              let thumb: string | undefined = undefined;
              if (urls?.length) {
                // 서버 모드에서는 wadouri 변환 유틸을 내부에서 사용(thumb.ts 참조)
                const imageId = urls[0].startsWith("wadouri:") ? urls[0] : `wadouri:${urls[0]}`;
                thumb = await imageIdToThumbDataURL(imageId, 160);
              }
              if (stop) return;
              next.push({ key: s.uid, number: s.number, desc: s.desc, count: urls?.length, thumb });
            } catch {
              next.push({ key: s.uid, number: s.number, desc: s.desc });
            }
          }
          if (!stop) setItems(next);
        } finally {
          if (!stop) setLoading(false);
        }
      }
    })();
    return () => { stop = true; };
  }, [filesBySeries, serverSeries, isLocalMode, whenReady]);

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
