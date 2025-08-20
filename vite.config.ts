import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    // 프로덕션 빌드 시 dicom-image-loader 동적 import 폴더를 dist로 복사
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@cornerstonejs/dicom-image-loader/dist/dynamic-import/*',
          dest: 'cornerstone-wasm'
        }
      ]
    })
  ],
  worker: { format: 'es' }
})