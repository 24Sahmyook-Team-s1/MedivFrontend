declare module '@cornerstonejs/dicom-image-loader' {
  export const external: { cornerstone?: any }
  export const wadouri: any
  export function init(): Promise<void>
}
