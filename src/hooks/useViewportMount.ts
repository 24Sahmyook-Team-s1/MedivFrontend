// src/hooks/useViewportMount.ts
import { useEffect } from "react";
import { useCornerstone } from "../stores/useCornerstone";

type ViewportMode = "stack" | "volume" | "volume3d";

export function useViewportMount(
  ref: React.RefObject<HTMLDivElement | null>,
  mode: ViewportMode = "stack"
) {
  const mount = useCornerstone((s) => s.mount);
  const unmount = useCornerstone((s) => s.unmount);
  const switchMode = useCornerstone((s) => s.switchMode);

  // ✅ 여기서 loadStack 추가로 가져오기
  const isReady = useCornerstone((s) => s.isReady);
  const loadFiles = useCornerstone((s) => s.loadFiles);
  const loadStack = useCornerstone((s) => s.loadStack); // ← 추가
  const whenReady = useCornerstone((s) => s.whenReady);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    mount(el, mode);
    return () => { unmount(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mount, unmount]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    switchMode(mode, el);
  }, [mode, switchMode, ref]);

  // ✅ 반환값에 loadStack 포함
  return { isReady, loadFiles, loadStack, whenReady };
}
