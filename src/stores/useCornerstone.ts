// src/stores/useCornerstone.ts
import { create } from "zustand";
import {
  initCornerstone,
  createDefaultToolGroup,
  createStackViewport,
  createVolumeViewport,
  createVolume3DViewport,
  createImageIdsFromFiles,
  loadIntoViewport,
  type ViewportMode,
} from "../lib/cornerstone";
import { fetchBlobs, fetchInstanceUrls } from "../api/dicom";

type CsApi = {
  renderingEngine: any;
  renderingEngineId: string;
  viewportId: string;
  mode: ViewportMode;
};

type State = {
  initialized: boolean;
  isReady: boolean;             // ✅ 뷰포트 준비 여부
  api: CsApi | null;
  files: File[];                // ✅ 세션 내 파일 배열
  lastImageIds: string[] | null; // ✅ 마지막으로 렌더한 imageIds (모드 전환시 재사용)
  _ro?: ResizeObserver;
};

type Actions = {
  init: () => Promise<void>;
  mount: (element: HTMLDivElement, mode?: ViewportMode) => Promise<void>;
  unmount: () => void;

  // 파일 관리
  addFiles: (newFiles: (File | Blob)[]) => void;
  replaceFiles: (newFiles: (File | Blob)[]) => void;
  clearFiles: () => void;

  // 로드 액션
  loadFiles: (files: (File | Blob)[]) => Promise<void>;
  loadSeries: (seriesId: string) => Promise<void>;
  switchMode: (mode: ViewportMode, element: HTMLDivElement) => Promise<void>;

  // 준비 대기
  whenReady: () => Promise<void>;
};

function toFileArray(
  items: (File | Blob)[],
  prefix = "inline",
  typeFallback = "application/dicom"
) {
  return items.map((it, i) =>
    it instanceof File
      ? it
      : new File([it], `${prefix}-${i}.dcm`, {
          type: (it as Blob).type || typeFallback,
        })
  );
}

let _readyResolvers: Array<() => void> = [];

export const useCornerstone = create<State & Actions>((set, get) => ({
  initialized: false,
  isReady: false,
  api: null,
  files: [],
  lastImageIds: null,
  _ro: undefined,

  // Cornerstone core/tools/loader 초기화
  init: async () => {
    if (get().initialized) return;
    await initCornerstone();
    set({ initialized: true });
  },

  // 뷰포트 마운트
  mount: async (element, mode = "stack") => {
    const { initialized, _ro } = get();
    if (!initialized) await get().init();

    // 기존 ResizeObserver 해제
    if (_ro) {
      try {
        _ro.disconnect();
      } catch {
        /* noop */
      }
      set({ _ro: undefined });
    }

    // 모드별 뷰포트 생성
    const created =
      mode === "stack"
        ? createStackViewport(element)
        : mode === "volume"
        ? createVolumeViewport(element)
        : createVolume3DViewport(element);

    const { renderingEngine, renderingEngineId, viewportId } = created;

    // 툴 그룹 바인딩
    createDefaultToolGroup(viewportId, renderingEngineId, mode);

    // 리사이즈 옵저버
    const ro = new ResizeObserver(() => renderingEngine.resize());
    ro.observe(element);

    set({
      api: { renderingEngine, renderingEngineId, viewportId, mode },
      _ro: ro,
      isReady: true, // ✅ 준비 완료
    });

    // whenReady 대기자 해제
    _readyResolvers.forEach((r) => r());
    _readyResolvers = [];

    // ✅ (선택) 기존 lastImageIds가 있다면 즉시 재적용
    const last = get().lastImageIds;
    if (last?.length) {
      await loadIntoViewport(renderingEngine, viewportId, mode, last);
    }
  },

  // 언마운트
  unmount: () => {
    const { _ro, api } = get();
    if (_ro) {
      try {
        _ro.disconnect();
      } catch {
        /* noop */
      }
    }
    // RenderingEngine 정리 (필요 시 destroy)
    try {
      api?.renderingEngine?.destroy?.();
    } catch {
      /* noop */
    }
    set({ api: null, _ro: undefined, isReady: false });
  },

  // ===== 파일 관리 전용 액션 =====
  addFiles: (newItems) => {
    const appended = toFileArray(newItems);
    const cur = get().files;
    set({ files: [...cur, ...appended] });
  },

  replaceFiles: (newItems) => {
    const replaced = toFileArray(newItems);
    set({ files: replaced });
  },

  clearFiles: () => set({ files: [], lastImageIds: null }),

  // ===== Cornerstone 로드 액션 =====
  loadFiles: async (items) => {
    const { api } = get();
    if (!api || !items?.length) return;

    // 상태에 먼저 반영 (누적 로드)
    get().addFiles(items);

    // Cornerstone imageIds 생성 후 로드
    const files = get().files;
    const imageIds = createImageIdsFromFiles(files);
    await loadIntoViewport(api.renderingEngine, api.viewportId, api.mode, imageIds);

    // 마지막 imageIds 저장
    set({ lastImageIds: imageIds });
  },

  loadSeries: async (seriesId) => {
    const { api } = get();
    if (!api) return;

    const urls = await fetchInstanceUrls(seriesId);
    const blobs = await fetchBlobs(urls);

    // 상태에 덮어쓰기(시리즈 단위로 교체하는 것이 자연스러움)
    const files = toFileArray(blobs, seriesId);
    set({ files });

    const imageIds = createImageIdsFromFiles(files);
    await loadIntoViewport(api.renderingEngine, api.viewportId, api.mode, imageIds);

    set({ lastImageIds: imageIds });
  },

  // 모드 전환: 간단히 재-mount (엔진/툴그룹/리사이즈 재구성)
  switchMode: async (mode, element) => {
    // 재마운트 전에 준비 플래그 내리고 대기자 초기화(선택)
    set({ isReady: false });
    await get().mount(element, mode);
  },

  // 준비 대기 Promise
  whenReady: () =>
    new Promise<void>((resolve) => {
      if (get().isReady) return resolve();
      _readyResolvers.push(resolve);
    }),
}));
