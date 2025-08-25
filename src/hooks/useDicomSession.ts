import { useCallback } from "react";
import { createImageIdsFromFiles } from "../lib/cornerstone"
import type { StackViewport } from "@cornerstonejs/core";

interface ApiRef {
  renderingEngine: any;
  viewportId: string;
}

export function useDicomSession(api: ApiRef | null) {
  const openFiles = useCallback(
    async (files: File[]) => {
      if (!api) return;
      if (!files.length) return;

      const imageIds = createImageIdsFromFiles(files);
      const viewport = api.renderingEngine.getViewport(api.viewportId) as StackViewport;
      await viewport.setStack(imageIds);
      viewport.render();
    },
    [api]
  );

  return { openFiles };
}
