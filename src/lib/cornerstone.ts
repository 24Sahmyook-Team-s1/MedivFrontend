// src/lib/cornerstone.ts
import { init as coreInit, Enums, RenderingEngine, volumeLoader, type Types } from '@cornerstonejs/core';
import {
  init as toolsInit,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  TrackballRotateTool,
  addTool,
  Enums as csToolsEnums,
} from '@cornerstonejs/tools';

// external 설정 불필요 — init만 사용
import { init as dicomInit, wadouri } from '@cornerstonejs/dicom-image-loader';

export async function initCornerstone() {
  await coreInit();
  toolsInit();
  await dicomInit();

  // 필요 시 wadouri.configure({ ... })
  // wadouri.configure({ useWebWorkers: true });
}

/** 뷰포트 모드 타입 */
export type ViewportMode = 'stack' | 'volume' | 'volume3d';

/** 존재하면 재사용, 없으면 생성 */
function ensureRenderingEngine(renderingEngineId: string) {
  try {
    // 일부 버전에선 getRenderingEngine가 없음 → try/catch
    const existed = (RenderingEngine as any).getRenderingEngine?.(renderingEngineId);
    if (existed) return existed;
  } catch { /* empty */ }
  return new RenderingEngine(renderingEngineId);
}
export function createDefaultToolGroup(
  viewportId: string,
  renderingEngineId: string,
  mode: 'stack' | 'volume' | 'volume3d' = 'stack'
) {
  const groupId = `tg-${mode}`;
  let toolGroup = ToolGroupManager.getToolGroup(groupId);
  if (!toolGroup) {
    toolGroup = ToolGroupManager.createToolGroup(groupId)!;
  }

  const safeAdd = (ToolCtor: any) => { try { addTool(ToolCtor); } catch { /* empty */ } };

  // 공통
  safeAdd(PanTool);
  safeAdd(ZoomTool);

  if (mode !== 'volume3d') {
    // ✅ MouseWheel 전용 툴이 없는 버전에서는 StackScrollTool을 그대로 쓰고
    //    바인딩을 "Wheel"로 걸어주면 동일하게 동작함
    safeAdd(WindowLevelTool);
    safeAdd(StackScrollTool);
  } else {
    safeAdd(TrackballRotateTool);
  }

  // 그룹에 등록
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(ZoomTool.toolName);

  if (mode !== 'volume3d') {
    toolGroup.addTool(WindowLevelTool.toolName);
    toolGroup.addTool(StackScrollTool.toolName);

    // 좌: WWWL, 중: Pan, 우: Zoom
    toolGroup.setToolActive(WindowLevelTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });
    toolGroup.setToolActive(PanTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
    });
    toolGroup.setToolActive(ZoomTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
    });

    // ✅ 휠로 슬라이스 스크롤
    toolGroup.setToolActive(StackScrollTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
    });
  } else {
    toolGroup.addTool(TrackballRotateTool.toolName);

    // 3D: 좌 회전, 중 Pan, 우 Zoom
    toolGroup.setToolActive(TrackballRotateTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });
    toolGroup.setToolActive(PanTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
    });
    toolGroup.setToolActive(ZoomTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
    });
  }

  toolGroup.addViewport(viewportId, renderingEngineId);
  return toolGroup;
}

/** Stack 뷰포트 생성 */
export function createStackViewport(element: HTMLDivElement) {
  const renderingEngineId = 'cs3d-engine';
  const viewportId = 'STACK-1';
  const renderingEngine = ensureRenderingEngine(renderingEngineId);

  renderingEngine.enableElement({
    viewportId,
    type: Enums.ViewportType.STACK,
    element,
  });

  return { renderingEngine, renderingEngineId, viewportId };
}

/** Volume(MPR, ORTHOGRAPHIC) 뷰포트 생성 */
export function createVolumeViewport(element: HTMLDivElement) {
  const renderingEngineId = 'cs3d-engine';
  const viewportId = 'VOL-ORTHO-1';
  const renderingEngine = ensureRenderingEngine(renderingEngineId);

  renderingEngine.enableElement({
    viewportId,
    type: Enums.ViewportType.ORTHOGRAPHIC,
    element,
    defaultOptions: { background: [0, 0, 0] },
  });

  return { renderingEngine, renderingEngineId, viewportId };
}

/** Volume3D 뷰포트 생성 */
export function createVolume3DViewport(element: HTMLDivElement) {
  const renderingEngineId = 'cs3d-engine';
  const viewportId = 'VOL-3D-1';
  const renderingEngine = ensureRenderingEngine(renderingEngineId);

  renderingEngine.enableElement({
    viewportId,
    type: Enums.ViewportType.VOLUME_3D,
    element,
    defaultOptions: { background: [0, 0, 0] },
  });

  return { renderingEngine, renderingEngineId, viewportId };
}

// File 또는 Blob을 등록 가능 (공식 API: fileManager.add(file: Blob) -> string)
export function createImageIdsFromFiles(files: (File | Blob)[]): string[] {
  if (!wadouri?.fileManager?.add) {
    throw new Error('wadouri fileManager가 초기화되지 않았습니다.');
  }
  return files.map((f) => wadouri.fileManager.add(f as Blob));
}

/** 공용 로더: Stack vs Volume/3D 자동 분기 */
export async function loadIntoViewport(
  renderingEngine: any,
  viewportId: string,
  mode: ViewportMode,
  imageIds: string[],
  opts?: {
    volumeId?: string;
    cameraPreset?: {
      viewPlaneNormal: [number, number, number];
      viewUp: [number, number, number];
    };
  }
) {
  if (mode === 'stack') {
    const vp = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
    await vp.setStack(imageIds);
    vp.render();
    return;
  }

  const volumeId =
    opts?.volumeId ?? `cornerstoneStreamingImageVolume:${hashImageIds(imageIds)}`;

  const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });
  await volume.load();

  const vp = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;
  await vp.setVolumes([{ volumeId }]);

  if (opts?.cameraPreset) {
    vp.setCamera(opts.cameraPreset);
  } else if (mode === 'volume') {
    // 기본 Axial 유사 카메라
    vp.setCamera({
      viewPlaneNormal: [0, 0, -1],
      viewUp: [0, -1, 0],
    });
  }
  vp.render();
}

function hashImageIds(imageIds: string[]) {
  const src = imageIds[0] + '::' + imageIds.length;
  let h = 0;
  for (let i = 0; i < src.length; i++) {
    h = (h << 5) - h + src.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
