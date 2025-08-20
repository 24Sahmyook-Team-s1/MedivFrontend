import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    // dicom-parser는 CJS라 dev에서 commonjs 변환 필요
    viteCommonjs(),
  ],
  // 워커 모듈은 ES 포맷 권장
  worker: {
    format: 'es',
  },
  // dep optimizer가 워커를 건드리지 않도록 제외
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
  // (polyseg/labelmap 등 WASM 쓸 땐 추가)
  // assetsInclude: ['**/*.wasm'],
})
