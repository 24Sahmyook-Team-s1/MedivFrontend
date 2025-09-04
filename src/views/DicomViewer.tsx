// src/views/DicomViewer.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useViewportMount } from "../hooks/useViewportMount";
import BottomBar from "../components/BottomBar";
import SeriesSidebar from "../components/SeriesSideBar";
import styled from "@emotion/styled";

type Props = { mode?: "stack" | "volume" | "volume3d" };

// ✅ state 타입 확장: filesBySeries 수신
type ViewerLocationState = {
  dicomFiles?: (File | Blob)[];       // 전체 합친 파일들 (기존)
  filesBySeries?: (File | Blob)[][];  // 시리즈별 파일 배열 (신규)
} | null;

const Wrapper = styled.div`
  display: grid; grid-template-rows: auto 1fr; height: 100%; width: 100%;
`;
const Container = styled.div`
  display: grid; grid-template-columns: 3fr 1fr; min-height: 0;
`;
const RightPane = styled.aside`
  display: grid; grid-template-rows: auto 1fr; gap: 12px;
  border-left: 1px solid #1a2b45; background:#0b111a; padding: 10px; overflow: auto;
`;

export default function DicomViewer({ mode = "stack" }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const { isReady, loadFiles, loadStack } = useViewportMount(divRef, mode);

  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ViewerLocationState) || null;

  // ✅ 네비게이션으로 들어온 payload
  const pendingFiles = state?.dicomFiles || null;
  const [localFilesBySeries] = useState<(File|Blob)[][] | null>(() => state?.filesBySeries ?? null);

  useEffect(() => {
    if (!isReady || !pendingFiles?.length) return;
    (async () => {
      try {
        // 기존: 전체 파일 한 번에 로드
        await loadFiles(pendingFiles);
      } finally {
        // URL state 정리
        navigate(location.pathname, { replace: true, state: null });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, pendingFiles]);

  return (
    <Wrapper>
      <BottomBar />
      <Container>
        <div
          className="viewport"
          ref={divRef}
          style={{ width: "100%", height: "100%", minHeight: 320, background: "#000" }}
        />
        <RightPane>
          {/* ✅ filesBySeries가 있으면 로컬 파일 모드로 썸네일/선택 */}
          <SeriesSidebar onSelect={loadStack} filesBySeries={localFilesBySeries ?? undefined} />
        </RightPane>
      </Container>
    </Wrapper>
  );
}
