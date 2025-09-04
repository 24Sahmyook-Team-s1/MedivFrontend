// src/hooks/useMultiStackViewports.ts
import { useEffect, useMemo, useRef, useState } from "react"; // 값(런타임에 남는 것)
import {
  Enums,
  getRenderingEngine,
  RenderingEngine,
  volumeLoader,
} from "@cornerstonejs/core";
// 타입(런타임에 제거됨)
import type { Types as CoreTypes } from "@cornerstonejs/core";
import { ToolGroupManager } from "@cornerstonejs/tools";
import { ensureCornerstoneReady } from "../lib/cornerstone";
import { useViewportLayout } from "../stores/useViewportLayout";

const ENGINE_ID = "cs3d-engine";
const TOOLGROUP_ID = "default";

type UseMultiOptions = {
  mode?: "stack"; // 추후 volume/3D 확장 가능
};

export function useMultiStackViewports(
  container: HTMLDivElement | null,
  refs: React.RefObject<HTMLDivElement | null>[],
  { mode = "stack" }: UseMultiOptions = {}
) {
  const { layout, activeViewportId } = useViewportLayout();
  const [isReady, setReady] = useState(false);
  const engineRef = useRef<RenderingEngine | null>(null);
  const toolGroupRef = useRef<ReturnType<
    typeof ToolGroupManager.createToolGroup
  > | null>(null);

  // 현재 레이아웃에서 사용할 viewport 정의
  const viewDefs = useMemo(() => {
    if (layout === "1x1") {
      return [{ viewportId: "STACK-1", idx: 0 }];
    }
    return [
      { viewportId: "STACK-1", idx: 0 },
      { viewportId: "STACK-2", idx: 1 },
      { viewportId: "STACK-3", idx: 2 },
      { viewportId: "STACK-4", idx: 3 },
    ];
  }, [layout]);

  useEffect(() => {
    let disposed = false;

    (async () => {
      if (!container) return;
      await ensureCornerstoneReady();

      // 렌더링 엔진 준비
      let engine = getRenderingEngine(ENGINE_ID);
      if (!engine) {
        engine = new RenderingEngine(ENGINE_ID);
      }
      engineRef.current = engine;

      // ToolGroup 준비(이미 있으면 재사용)
      let tg = ToolGroupManager.getToolGroup(TOOLGROUP_ID);
      if (!tg) tg = ToolGroupManager.createToolGroup(TOOLGROUP_ID);
      toolGroupRef.current = tg;

      // DOM이 완전히 레이아웃된 후에 생성 (context null 회피)
      await new Promise(requestAnimationFrame);

      // setViewports로 현재 레이아웃의 뷰포트들 구성
      const viewports: CoreTypes.PublicViewportInput[] = viewDefs.map(
        ({ viewportId, idx }) => {
          const el = refs[idx]?.current;
          if (!el)
            throw new Error(`Viewport element missing for ${viewportId}`);
          return {
            viewportId,
            type: Enums.ViewportType.STACK,
            element: el,
            defaultOptions: {
              background: [0, 0, 0],
            },
          };
        }
      );

      engine.setViewports(viewports);
      await new Promise(requestAnimationFrame); // ✅ DOM 레이아웃 1프레임 대기 
      engine.resize();

      // ToolGroup에 현재 레이아웃 뷰포트 등록 (중복 등록 자동 무시)
      for (const { viewportId } of viewDefs) {
        tg?.addViewport(viewportId, ENGINE_ID);
      }

      if (!disposed) setReady(true);
    })();

    return () => {
      disposed = true;
      // 레이아웃 바뀔 때 setViewports로 교체하므로 굳이 엔진 dispose는 하지 않음
      // 필요 시 특정 viewport만 제거/재구성 가능
    };
  }, [container, viewDefs, refs]);

  // 외부에서 스택 로드 (특정 또는 전체)
  async function loadStack(
    imageIds: string[],
    opts?: { target?: string; all?: boolean }
  ) {
    const engine = engineRef.current;
    if (!engine) return;

    const targets = (
      opts?.all
        ? viewDefs.map((v) => v.viewportId)
        : [opts?.target || activeViewportId || viewDefs[0].viewportId]
    ).filter(Boolean) as string[];

    for (const vpId of targets) {
      const vp = engine.getViewport(vpId);
      if (vp?.type !== Enums.ViewportType.STACK) continue;
      // @ts-ignore: StackViewport 타입 단언
      await (vp as any).setStack(imageIds);
      vp.render();
    }
  }

  return { isReady, loadStack };
}
