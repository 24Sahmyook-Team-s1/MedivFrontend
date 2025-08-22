// src/lib/cornerstone.ts
import { init as coreInit, Enums, RenderingEngine } from '@cornerstonejs/core';
import {
  init as toolsInit,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  addTool,
  Enums as csToolsEnums,
} from '@cornerstonejs/tools';

// ✅ external 없이 init만 사용
import { init as dicomInit, wadouri } from '@cornerstonejs/dicom-image-loader';

export async function initCornerstone() {
  await coreInit();
  toolsInit();

  // 🔑 이 한 줄이면 충분 (external 설정 불필요)
  await dicomInit();

  // 필요 시 wadouri.configure(...) 가능
  // wadouri.configure({ /* 옵션 */ });
}

export function createDefaultToolGroup(viewportId: string, renderingEngineId: string) {
  addTool(ZoomTool);
  addTool(PanTool);
  addTool(WindowLevelTool);
  addTool(StackScrollTool);

  const toolGroup = ToolGroupManager.createToolGroup('default');
  if (!toolGroup) throw new Error('Failed to create Tool Group');

  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(WindowLevelTool.toolName);
  toolGroup.addTool(StackScrollTool.toolName);

  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
  });
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
  });
  toolGroup.setToolActive(StackScrollTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
  });

  toolGroup.addViewport(viewportId, renderingEngineId);
  return toolGroup;
}

export function createStackViewport(element: HTMLDivElement) {
  const renderingEngineId = 'cs3d-engine';
  const viewportId = 'STACK-1';
  const renderingEngine = new RenderingEngine(renderingEngineId);

  renderingEngine.enableElement({
    viewportId,
    type: Enums.ViewportType.STACK,
    element,
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
