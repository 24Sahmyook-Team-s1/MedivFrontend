// src/hooks/useViewportMount.ts
import { useEffect } from "react";
import { useCornerstone } from "../stores/useCornerstone";

type ViewportMode = "stack" | "volume" | "volume3d";

/**
 * ref가 가리키는 element에 Cornerstone 뷰포트를 붙인다.
 * - 최초 마운트: mount(element, mode)
 * - mode 변경: switchMode(mode, element)
 * - 언마운트: unmount()
 * 또한, 뷰포트 준비 상태와 파일 로더를 외부에 노출한다.
 */
export function useViewportMount(
  ref: React.RefObject<HTMLDivElement | null>,
  mode: ViewportMode = "stack"
) {
  const mount = useCornerstone((s) => s.mount);
  const unmount = useCornerstone((s) => s.unmount);
  const switchMode = useCornerstone((s) => s.switchMode);

  // 확장: 뷰포트 준비 여부와 파일 로드 API
  const isReady = useCornerstone((s) => s.isReady);
  const loadFiles = useCornerstone((s) => s.loadFiles);
  const whenReady = useCornerstone((s) => s.whenReady); // 선택 사용

  // 최초 마운트/언마운트
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    mount(el, mode);
    return () => {
      unmount();
    };
    // mount/unmount는 스토어 메서드이므로 ref.current를 의존성에 넣지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mount, unmount]);

  // 모드 변경
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    switchMode(mode, el);
  }, [mode, switchMode, ref]);

  return { isReady, loadFiles, whenReady };
}
