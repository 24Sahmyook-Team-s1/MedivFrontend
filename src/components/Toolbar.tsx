/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

export default function Toolbar() {
  return (
    <div
      css={css`
        display: flex; gap: 8px; align-items: center;
        padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.04);
        backdrop-filter: blur(4px);
      `}
    >
      <strong>Tools:</strong>
      <span>Left: WL</span>
      <span>Middle: Pan</span>
      <span>Right: Zoom</span>
      <span>Wheel: Scroll</span>
    </div>
  )
}
