// src/components/DicomControls.tsx
import React, { useState } from "react";
import { useCornerstone } from "../stores/useCornerstone";

export default function DicomControls() {
  const [seriesId, setSeriesId] = useState("SERIES_1");
  const loadFiles = useCornerstone((s) => s.loadFiles);
  const loadSeries = useCornerstone((s) => s.loadSeries);

  async function onChangeFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await loadFiles(files);
  }

  return (
    <div style={{ padding: 8, display: "flex", gap: 8, alignItems: "center" }}>
      <input
        value={seriesId}
        onChange={(e) => setSeriesId(e.target.value)}
        placeholder="Series ID"
        style={{ padding: 6 }}
      />
      <button onClick={() => loadSeries(seriesId)}>Load from Server</button>

      <input
        type="file"
        multiple
        onChange={onChangeFiles}
        accept=".dcm,application/dicom,application/octet-stream"
      />
    </div>
  );
}
