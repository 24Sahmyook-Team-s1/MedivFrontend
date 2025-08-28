// src/views/DicomViewer.tsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useViewportMount } from "../hooks/useViewportMount";
import DicomLoad from "../components/DicomLoad";
import BottomBar from "../components/BottomBar";
import styled from "@emotion/styled";

type Props = {
  mode?: "stack" | "volume" | "volume3d";
};

// 라우터 state 타입 (파일 배열이 올 것)
type ViewerLocationState = {
  dicomFiles?: (File | Blob)[];
} | null;

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  width: 100%;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
`;

export default function DicomViewer({ mode = "stack" }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  // 훅이 뷰포트 준비 여부와 로드 함수를 노출하도록 업데이트(아래 2) 참고)
  const { isReady, loadFiles } = useViewportMount(divRef, mode);

  const location = useLocation();
  const navigate = useNavigate();

  // 라우터 state에서 파일 추출
  const state = (location.state as ViewerLocationState) || null;
  const pendingFiles = state?.dicomFiles;

  // 뷰포트가 준비된 뒤 파일 로드 → 성공 시 state를 비워 중복 로드를 방지
  useEffect(() => {
    if (!isReady) return;
    if (!pendingFiles || pendingFiles.length === 0) return;

    (async () => {
      try {
        await loadFiles(pendingFiles);
      } finally {
        // 뒤로가기/새로고침 시 중복 로드 방지
        navigate(location.pathname, { replace: true, state: null });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, pendingFiles]); // loadFiles는 훅 내부에서 안정적 ref를 사용하게 구현

  return (
    <Wrapper>
      <BottomBar />
      <Container>
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
        <DicomLoad />
      </Container>
    </Wrapper>
  );
}
