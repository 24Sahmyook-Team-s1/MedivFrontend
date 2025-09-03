/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useStudyStore } from "../stores/useStudyStore";
import { useCornerstone } from "../stores/useCornerstone";
import { fetchInstanceUrls } from "../api/dicom";
import { imageIdToThumbDataURL, toWadouri } from "../lib/thumb"; // ✅ 유틸 연결

type Props = { onSelect: (imageIds: string[]) => Promise<void> | void };

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2열 */
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

type Item = { uid: string; number?: number; desc?: string; count?: number; thumb?: string };

export default function SeriesSidebar({ onSelect }: Props) {
  const { StudyList } = useStudyStore();
  const whenReady = useCornerstone((s) => s.whenReady);

  const [active, setActive] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // StudyList → 시리즈 목록
  const series = useMemo(() => {
    const out: Item[] = [];
    for (const st of (StudyList ?? []) as any[]) {
      for (const se of st.series ?? []) {
        out.push({ uid: se.seriesInstanceUID, number: se.seriesNumber, desc: se.seriesDescription });
      }
    }
    return out;
  }, [StudyList]);

  // ✅ Cornerstone 준비 후 첫 프레임 썸네일 생성
  useEffect(() => {
    let stop = false;
    (async () => {
      if (!series.length) { setItems([]); return; }
      setLoading(true);
      try {
        await whenReady(); // 코어/로더 준비 대기
        const next: Item[] = [];
        for (const s of series) {
          try {
            const urls = await fetchInstanceUrls(s.uid);
            if (!urls?.length) { next.push({ ...s }); continue; }
            const firstId = toWadouri(urls[0]);
            const thumb = await imageIdToThumbDataURL(firstId, 160);
            if (stop) return;
            next.push({ ...s, thumb, count: urls.length });
          } catch {
            next.push({ ...s });
          }
        }
        if (!stop) setItems(next);
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, [series, whenReady]);

  const handleClick = async (uid: string) => {
    setActive(uid);
    const urls = await fetchInstanceUrls(uid);
    const imageIds = urls.map(toWadouri);
    await onSelect(imageIds); // DicomViewer에서 loadStack과 연결됨
  };

  if (!series.length) return <div style={{opacity:.7,fontSize:12}}>불러온 시리즈가 없습니다.</div>;

  return (
    <Grid>
      {items.map((s) => (
        <Thumb key={s.uid} onClick={() => handleClick(s.uid)} $active={active === s.uid} title={s.desc}>
          {s.thumb ? <img src={s.thumb} alt={s.desc || s.uid} /> : <div className="skeleton" />}
          <div className="meta">
            <span>S{String(s.number ?? "").padStart(2, "0")}</span>
            <span>{s.count ?? (loading ? "..." : "-")}</span>
          </div>
        </Thumb>
      ))}
    </Grid>
  );
}
