// src/hooks/useViewportMount.ts
import { useEffect } from "react";
import { useCornerstone } from "../stores/useCornerstone";

type ViewportMode = "stack" | "volume" | "volume3d";

/**
 * ref가 가리키는 element에 Cornerstone 뷰포트를 붙인다.
 * - 최초 마운트: mount(element, mode)
 * - mode 변경: switchMode(mode, element)
 * - 언마운트: unmount()
 */
export function useViewportMount(
  ref: React.RefObject<HTMLDivElement | null>,
  mode: ViewportMode = "stack"
) {
  const mount = useCornerstone((s) => s.mount);
  const unmount = useCornerstone((s) => s.unmount);
  const switchMode = useCornerstone((s) => s.switchMode);

  // 최초 마운트/언마운트
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    mount(el, mode);
    return () => { unmount(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mount, unmount, ref]);

  // 모드 변경
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    switchMode(mode, el);
  }, [mode, switchMode, ref]);
}
