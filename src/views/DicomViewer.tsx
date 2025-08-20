// src/views/DicomViewer.tsx
import React, { useEffect, useRef, useState } from 'react'
import {
  createDefaultToolGroup,
  createStackViewport,
  initCornerstone,
  createImageIdsFromFiles,
} from '../lib/cornerstone'

export default function DicomViewer() {
  const divRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<{
    // eslint-disable-next-line
    renderingEngine: any
    viewportId: string
    renderingEngineId: string
  } | null>(null)

  useEffect(() => {
    let ro: ResizeObserver | undefined

    ;(async () => {
      await initCornerstone()
      if (!divRef.current) return

      const { renderingEngine, renderingEngineId, viewportId } = createStackViewport(divRef.current)
      createDefaultToolGroup(viewportId, renderingEngineId)
      setApi({ renderingEngine, viewportId, renderingEngineId })
      ro = new ResizeObserver(() => renderingEngine.resize())
      ro.observe(divRef.current)
    })()

    return () => {
      if (ro && divRef.current) ro.disconnect()
    }
  }, [])

  async function openFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!api) return
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // 로컬 DICOM 파일을 imageId로 변환 (any/동적경로 없이 안전하게)
    const imageIds = createImageIdsFromFiles(files)

    // 스택 설정 → 렌더
    const viewport = api.renderingEngine.getViewport(api.viewportId)
    // setStack는 StackViewport 전용 메서드이지만, 타입 선언이 좁아서 한 줄만 예외 허용
    await viewport.setStack(imageIds)
    viewport.render()
  }

  return (
    <div className="viewer-shell">
      <div className="viewport" ref={divRef} />
      <div>
        <input type="file" multiple onChange={openFiles} accept=".dcm,application/dicom" />
      </div>
    </div>
  )
}
