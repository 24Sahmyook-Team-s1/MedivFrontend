// src/lib/thumb.ts
import { imageLoader } from '@cornerstonejs/core'

/**
 * imageId(예: 'wadouri:https://...')를 작게 그려 dataURL로 반환
 */
export async function imageIdToThumbDataURL(
  imageId: string,
  maxSize = 160
): Promise<string> {
  const image: any = await imageLoader.loadImage(imageId)

  // 원본 크기
  const w = image.width
  const h = image.height

  // 짧은 변 기준으로 축소
  const scale = Math.min(maxSize / w, maxSize / h)
  const tw = Math.max(1, Math.round(w * scale))
  const th = Math.max(1, Math.round(h * scale))

  // Cornerstone IImage는 내부 캔버스를 노출(getCanvas)하거나
  // getImageData()를 제공함. 우선 호환폭 넓게 처리
  let srcCanvas: HTMLCanvasElement
  if (typeof (image as any).getCanvas === 'function') {
    srcCanvas = (image as any).getCanvas()
  } else {
    // getImageData로 직접 그림
    const tmp = document.createElement('canvas')
    tmp.width = w
    tmp.height = h
    const ctx = tmp.getContext('2d')!
    const imageData = image.getImageData()
    ctx.putImageData(imageData, 0, 0)
    srcCanvas = tmp
  }

  // 리사이즈용 캔버스
  const canvas = document.createElement('canvas')
  canvas.width = tw
  canvas.height = th
  const ctx2 = canvas.getContext('2d', { willReadFrequently: false })!
  ctx2.imageSmoothingEnabled = true
  ctx2.drawImage(srcCanvas, 0, 0, w, h, 0, 0, tw, th)

  return canvas.toDataURL('image/jpeg', 0.8)
}

/** 서버에서 받은 인스턴스 URL → cornerstone imageId 로 변환 */
export function toWadouri(imageUrl: string) {
  // 필요 시 토큰/쿼리 추가
  return imageUrl.startsWith('wadouri:') ? imageUrl : `wadouri:${imageUrl}`
}
