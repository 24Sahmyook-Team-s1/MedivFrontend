// src/types/viewports.ts
export type ViewportType = 'stack' | 'volume' | 'volume3d';
export type Orientation = 'axial' | 'sagittal' | 'coronal' | 'oblique';

export type LayoutCell = {
  key: string;               // "vp1" 등
  type: ViewportType;
  orientation?: Orientation; // volume/volume3d일 때만 사용
};

export type LayoutPresetId =
  | 'single-2d'        // 1개 Stack
  | 'single-3d'        // 1개 3D
  | 'mpr-3up'          // Axial/Sagittal/Coronal (3개)
  | 'mpr-3up+3d'       // 3개 MPR + 1개 3D
  | 'dual-2d';         // Stack 2개

export const LAYOUTS: Record<LayoutPresetId, LayoutCell[]> = {
  'single-2d': [{ key: 'vp1', type: 'stack' }],
  'single-3d': [{ key: 'vp1', type: 'volume3d' }],
  'mpr-3up': [
    { key: 'vp1', type: 'volume', orientation: 'axial' },
    { key: 'vp2', type: 'volume', orientation: 'sagittal' },
    { key: 'vp3', type: 'volume', orientation: 'coronal' },
  ],
  'mpr-3up+3d': [
    { key: 'vp1', type: 'volume', orientation: 'axial' },
    { key: 'vp2', type: 'volume', orientation: 'sagittal' },
    { key: 'vp3', type: 'volume', orientation: 'coronal' },
    { key: 'vp4', type: 'volume3d' },
  ],
  'dual-2d': [
    { key: 'vp1', type: 'stack' },
    { key: 'vp2', type: 'stack' },
  ],
};
