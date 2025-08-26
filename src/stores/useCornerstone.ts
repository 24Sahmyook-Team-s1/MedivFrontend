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
  renderingEngine: any; // Cornerstone RenderingEngine
  renderingEngineId: string;
  viewportId: string;
  mode: ViewportMode;
};

type State = {
  initialized: boolean;
  api: CsApi | null;
  _ro?: ResizeObserver;
};

type Actions = {
  init: () => Promise<void>;
  mount: (element: HTMLDivElement, mode?: ViewportMode) => Promise<void>;
  unmount: () => void;
  loadFiles: (files: (File | Blob)[]) => Promise<void>;
  loadSeries: (seriesId: string) => Promise<void>;
  switchMode: (mode: ViewportMode, element: HTMLDivElement) => Promise<void>;
};

export const useCornerstone = create<State & Actions>((set, get) => ({
  initialized: false,
  api: null,

  init: async () => {
    if (get().initialized) return;
    await initCornerstone();
    set({ initialized: true });
  },

  mount: async (element, mode = "stack") => {
    const { initialized, _ro } = get();
    if (!initialized) await get().init();

    // 기존 ResizeObserver 해제
    if (_ro) {
      try { _ro.disconnect(); } catch { /* empty */ }
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

    // 모드에 맞는 툴 그룹 바인딩
    createDefaultToolGroup(viewportId, renderingEngineId, mode);

    // 리사이즈 옵저버
    const ro = new ResizeObserver(() => renderingEngine.resize());
    ro.observe(element);

    set({
      api: { renderingEngine, renderingEngineId, viewportId, mode },
      _ro: ro,
    });
  },

  unmount: () => {
    const { _ro } = get();
    if (_ro) {
      try { _ro.disconnect(); } catch { /* empty */ }
    }
    set({ api: null, _ro: undefined });
  },

  loadFiles: async (files) => {
    const { api } = get();
    if (!api || !files?.length) return;

    const imageIds = createImageIdsFromFiles(files);
    await loadIntoViewport(api.renderingEngine, api.viewportId, api.mode, imageIds);
  },

  loadSeries: async (seriesId) => {
    const { api } = get();
    if (!api) return;

    const urls = await fetchInstanceUrls(seriesId);
    const blobs = await fetchBlobs(urls);

    const files = blobs.map(
      (b, i) =>
        new File([b], `${seriesId}-${i}.dcm`, {
          type: b.type || "application/dicom",
        })
    );

    const imageIds = createImageIdsFromFiles(files);
    await loadIntoViewport(api.renderingEngine, api.viewportId, api.mode, imageIds);
  },

  switchMode: async (mode, element) => {
    // 간단히 재-mount (엔진/툴그룹/리사이즈 재구성)
    await get().mount(element, mode);
  },
}));
