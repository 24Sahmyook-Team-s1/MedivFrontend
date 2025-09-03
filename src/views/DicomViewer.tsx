// src/views/DicomViewer.tsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useViewportMount } from "../hooks/useViewportMount";
import DicomLoad from "../components/DicomLoad";
import BottomBar from "../components/BottomBar";
import SeriesSidebar from "../components/SeriesSideBar";
import styled from "@emotion/styled";

type Props = { mode?: "stack" | "volume" | "volume3d" };
type ViewerLocationState = { dicomFiles?: (File | Blob)[] } | null;

const Wrapper = styled.div`
  display: grid; grid-template-rows: auto 1fr; height: 100%; width: 100%;
`;
const Container = styled.div`
  display: grid; grid-template-columns: 3fr 1fr; min-height: 0; /* overflow 안전 */
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
  const pendingFiles = state?.dicomFiles;

  useEffect(() => {
    if (!isReady || !pendingFiles?.length) return;
    (async () => {
      try { await loadFiles(pendingFiles); }
      finally { navigate(location.pathname, { replace: true, state: null }); }
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
          {/* 하단: 시리즈 썸네일 2×n */}
          <SeriesSidebar onSelect={loadStack} />
        </RightPane>
      </Container>
    </Wrapper>
  );
}
