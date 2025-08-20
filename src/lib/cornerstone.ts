// src/lib/cornerstone.ts (수정본)
import {
  init as coreInit,
  Enums,
  RenderingEngine,
  // 필요할 때만 주석 해제 (미사용이면 린트 경고)
  // setUseCPURendering,
} from '@cornerstonejs/core'

import {
  init as toolsInit,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,          // ✅ v2 명칭
  addTool,
  Enums as csToolsEnums,     // ✅ MouseBindings 여기서 사용
} from '@cornerstonejs/tools'

import * as dicomImageLoader from '@cornerstonejs/dicom-image-loader'

export async function initCornerstone() {
  await coreInit()
  toolsInit()
  if (typeof dicomImageLoader.init === 'function') {
    await dicomImageLoader.init()
  }
  // 디버깅용 CPU 강제 렌더링이 필요하면:
  // setUseCPURendering(true)
}

export function createDefaultToolGroup(viewportId: string, renderingEngineId: string) {
  // 전역 툴 등록
  addTool(ZoomTool)
  addTool(PanTool)
  addTool(WindowLevelTool)
  addTool(StackScrollTool)   // ✅ 변경

  const toolGroup = ToolGroupManager.createToolGroup('default')
  if (!toolGroup) {
    throw new Error('Failed to create Tool Group');
  }

  toolGroup.addTool(ZoomTool.toolName)
  toolGroup.addTool(PanTool.toolName)
  toolGroup.addTool(WindowLevelTool.toolName)
  toolGroup.addTool(StackScrollTool.toolName)

  // 바인딩 (좌/중/우 클릭 + 휠)
  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
  })
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
  })
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
  })
  toolGroup.setToolActive(StackScrollTool.toolName, {
    // v2에서 휠은 툴과 분리되었지만, 바인딩으로 연결합니다.
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
  })

  toolGroup.addViewport(viewportId, renderingEngineId)
  return toolGroup
}

export function createStackViewport(element: HTMLDivElement) {
  const renderingEngineId = 'cs3d-engine'
  const viewportId = 'STACK-1'
  const renderingEngine = new RenderingEngine(renderingEngineId)

  renderingEngine.enableElement({
    viewportId,
    type: Enums.ViewportType.STACK,
    element,
  })
  return { renderingEngine, renderingEngineId, viewportId }
}

export function createImageIdsFromFiles(files: File[]): string[] {
// eslint-disable-next-line
    const wadouri = (dicomImageLoader as any).wadouri
  if (!wadouri?.fileManager?.add) {
    throw new Error('wadouri fileManager가 초기화되지 않았습니다.')
  }
  return files.map((f) => wadouri.fileManager.add(f))
}
