// src/views/DicomViewer.tsx
import React, { useRef } from "react";
import { useViewportMount } from "../hooks/useViewportMount";
import DicomLoad from "../components/DicomLoad";
import BottomBar from "../components/BottomBar";

type Props = {
  mode?: "stack" | "volume" | "volume3d";
};

export default function DicomViewer({ mode = "stack" }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  useViewportMount(divRef, mode);

  return (
    <>
      <div
        className="viewport"
        ref={divRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 320,
          background: "#000",
        }}
      />
      <DicomLoad />
      <BottomBar/>
    </>
  );
}
