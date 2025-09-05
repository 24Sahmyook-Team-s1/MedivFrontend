// src/views/DicomViewer.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import BottomBar from "../components/BottomBar";
import SeriesSideBar from "../components/SeriesSideBar";
import { createImageIdsFromFiles } from "../lib/cornerstone";
import { useViewportLayout } from "../stores/useViewportLayout";
import { useMultiStackViewports } from "../hooks/useMulitStackViewPorts";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ✅ state 타입 확장: filesBySeries 수신
type ViewerLocationState = {
  dicomFiles?: (File | Blob)[]; // 전체 합친 파일들 (기존)
  filesBySeries?: (File | Blob)[][]; // 시리즈별 파일 배열 (신규)
} | null;

type Props = { mode?: "stack" };

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
`;

// 🔙 상단 헤더 & 뒤로가기 버튼
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: #0d1520;
  border-bottom: 1px solid #1b2a42;
`;
const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0a111a;
  border: 1px solid #1a2b45;
  color: #d7e7fb;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  &:hover {
    background: #0d1520;
    border-color: #27405f;
  }
`;
const Container = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  min-height: 0;
`;
const Grid = styled.div<{ layout: "1x1" | "2x2" }>`
  display: grid;
  gap: 6px;
  background: #000;
  padding: 6px;
  ${({ layout }) =>
    layout === "1x1"
      ? `grid-template-columns: 1fr; grid-template-rows: 1fr;`
      : `grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;`}
  & > div {
    min-height: 200px;
    background: #000;
    position: relative;
    outline: 1px solid #111;
  }
  & > .active {
    outline: 2px solid #4ea1ff;
  }
`;
const TopBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #1a2b45;
  background: #0b111a;
  button {
    background: #0e1724;
    border: 1px solid #1a2b45;
    color: #b9d3ff;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
  }
  button[data-active="true"] {
    border-color: #4ea1ff;
    color: #e6f0ff;
  }
`;

export default function DicomViewer({ mode = "stack" }: Props) {
  //Location Patch
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/Studies");
  };
  const state = (location.state as ViewerLocationState) || null;
  const pendingFiles = state?.dicomFiles || null;
  const filesBySeriesFromURL = state?.filesBySeries || null;
  // 🧷 URL state → 로컬 state로 영구 보관
  const [filesBySeries, setFilesBySeries] = useState<(File | Blob)[][] | null>(
    null
  );
  useEffect(() => {
    if (filesBySeriesFromURL && !filesBySeries)
      setFilesBySeries(filesBySeriesFromURL);
  }, [filesBySeriesFromURL, filesBySeries]);

  const containerRef = useRef<HTMLDivElement>(null);
  const vpRef1 = useRef<HTMLDivElement>(null);
  const vpRef2 = useRef<HTMLDivElement>(null);
  const vpRef3 = useRef<HTMLDivElement>(null);
  const vpRef4 = useRef<HTMLDivElement>(null);
  const vpRefs = useMemo(() => [vpRef1, vpRef2, vpRef3, vpRef4], []);
  const { layout, setLayout, activeViewportId, setActiveViewport } =
    useViewportLayout() as any;

  const { isReady, loadStack } = useMultiStackViewports(
    containerRef.current,
    vpRefs,
    { mode }
  );

  // 최초 로드: dicomFiles가 넘어온 경우 활성 뷰포트에 로드
  useEffect(() => {
    if (!isReady || !pendingFiles?.length) return;
    const imageIds = createImageIdsFromFiles(pendingFiles as File[]);
    (async () => {
      await loadStack(imageIds, { target: activeViewportId || "STACK-1" });
      navigate(location.pathname, { replace: true, state: null });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, pendingFiles]);

  // 레이아웃에 따라 쓸 뷰포트 리스트
  const visible = useMemo(
    () =>
      layout === "1x1"
        ? ["STACK-1"]
        : ["STACK-1", "STACK-2", "STACK-3", "STACK-4"],
    [layout]
  );

  // viewport 클릭 시 활성화
  function handleClickViewport(id: string) {
    setActiveViewport(id);
  }

  // SeriesSideBar → 선택 시 활성 뷰포트에 로드
  async function handleSelect(imageIds: string[]) {
    await loadStack(imageIds, { target: activeViewportId || visible[0] });
  }

  return (
    <Wrapper ref={containerRef}>
      <TopBar>
        <button onClick={() => setLayout("1x1")} data-active={layout === "1x1"}>
          Single
        </button>
        <button onClick={() => setLayout("2x2")} data-active={layout === "2x2"}>
          2×2
        </button>
        {/* 필요하면 "모든 뷰포트에 로드" 토글도 가능 */}
        <BackBtn onClick={goBack} aria-label="뒤로가기">
          <ArrowLeft size={16} />
          뒤로가기
        </BackBtn>
      </TopBar>

      <Container>
        <Grid layout={layout}>
          {visible.map((id, i) => (
            <div
              key={id}
              ref={vpRefs[i]}
              className={activeViewportId === id ? "active" : ""}
              onClick={() => handleClickViewport(id)}
            />
          ))}
        </Grid>

        <aside
          style={{
            borderLeft: "1px solid #1a2b45",
            background: "#0b111a",
            padding: 10,
            overflow: "auto",
          }}
        >
          <SeriesSideBar
            onSelect={handleSelect}
            filesBySeries={filesBySeries ?? undefined}
          />
        </aside>
      </Container>

      <BottomBar />
    </Wrapper>
  );
}
