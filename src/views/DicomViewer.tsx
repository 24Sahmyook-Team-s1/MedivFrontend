// src/views/DicomViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  createDefaultToolGroup,
  createStackViewport,
  initCornerstone,
  createImageIdsFromFiles,
} from "../lib/cornerstone";
import type { StackViewport } from "@cornerstonejs/core";
import DicomLoad from "../components/DicomLoad";

/** ---------------------------
 *  서버 통신 유틸 (임시, 필요 시 src/api로 분리)
 *  - GET /api/series/:seriesId/instances  -> string[] (각 DICOM 파일 URL)
 *  - GET 각 URL -> Blob(DICOM)
 * -------------------------- */
async function fetchInstanceUrls(seriesId: string): Promise<string[]> {
  const res = await fetch(`/api/series/${seriesId}/instances`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load instance list");
  const urls = await res.json();
  if (!Array.isArray(urls)) throw new Error("Invalid instance list response");
  return urls as string[];
}

async function fetchBlobs(urls: string[]): Promise<Blob[]> {
  const blobs: Blob[] = [];
  for (const u of urls) {
    const r = await fetch(u, { method: "GET" });
    if (!r.ok) throw new Error(`Failed to fetch DICOM: ${u}`);
    blobs.push(await r.blob());
  }
  return blobs;
}

export default function DicomViewer() {
  const divRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderingEngine: any;
    viewportId: string;
    renderingEngineId: string;
  } | null>(null);

  // 테스트용: 입력한 시리즈 ID로 서버에서 로드
  const [seriesIdInput, setSeriesIdInput] = useState("SERIES_1");

  useEffect(() => {
    let ro: ResizeObserver | undefined;
    const element = divRef.current;

    (async () => {
      await initCornerstone();
      if (!element) return;

      const { renderingEngine, renderingEngineId, viewportId } =
        createStackViewport(element);

      createDefaultToolGroup(viewportId, renderingEngineId);
      setApi({ renderingEngine, viewportId, renderingEngineId });

      // 뷰포트 리사이즈 대응
      ro = new ResizeObserver(() => renderingEngine.resize());
      ro.observe(element);
    })();

    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  // 로컬 파일 로드(기존)
  async function openFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!api) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageIds = createImageIdsFromFiles(files);
    const viewport = api.renderingEngine.getViewport(api.viewportId) as StackViewport;
    await viewport.setStack(imageIds);
    viewport.render();
  }

  // ✅ 테스트용: 서버에서 Blob 받아와서 표시
  async function openSeriesFromServer(seriesId: string) {
    if (!api) return;
    // 1) 인스턴스 URL 배열
    const urls = await fetchInstanceUrls(seriesId);
    // 2) 각 URL -> Blob
    const blobs = await fetchBlobs(urls);
    // 3) Blob -> File 래핑 (MIME은 넓게)
    const files = blobs.map(
      (b, i) => new File([b], `${seriesId}-${i}.dcm`, { type: b.type || "application/dicom" })
    );
    // 4) File[] -> imageIds
    const imageIds = createImageIdsFromFiles(files);
    // 5) 스택 적용
    const viewport = api.renderingEngine.getViewport(api.viewportId) as StackViewport;
    await viewport.setStack(imageIds);
    viewport.render();
  }

  return (
    <div
      className="viewer-shell"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 뷰포트: 실제 픽셀 크기 확보 */}
      <div
        className="viewport"
        ref={divRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 320,
          background: "#000",
        }}
      />

      {/* 하단 컨트롤: 테스트용 버튼 + 로컬 파일 업로드 */}
      <div style={{ padding: 8, display: "flex", gap: 8, alignItems: "center" }}>
        {/* ✅ 테스트용: 서버에서 바로 로드 */}
        <input
          value={seriesIdInput}
          onChange={(e) => setSeriesIdInput(e.target.value)}
          placeholder="Series ID"
          style={{ padding: 6 }}
        />
        <button onClick={() => openSeriesFromServer(seriesIdInput)}>
          Load from Server
        </button>

        {/* 로컬 파일 로더(기존) */}
        <input
          type="file"
          multiple
          onChange={openFiles}
          accept=".dcm,application/dicom,application/octet-stream"
        />

        <DicomLoad />
      </div>
    </div>
  );
}
