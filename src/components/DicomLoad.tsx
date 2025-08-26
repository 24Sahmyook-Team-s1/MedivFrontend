// src/views/DicomLoad.tsx
import axios from "axios";
import { useCornerstone } from "../stores/useCornerstone";

export default function DicomLoad() {
  const loadFiles = useCornerstone((s) => s.loadFiles);

  async function handleView() {
    try {
      const res = await axios.get(
        "http://210.94.241.47:8080/dicom/dicom/studies/1/series/1/images/1/stream",
        { responseType: "blob" }
      );

      const contentType =
        (res.headers?.["content-type"] as string) || "application/dicom";
      const filename = getFilenameFromHeaders(res.headers) || "inline.dcm";

      // Blob → File 로 감싸서 바로 로드
      const file = new File([res.data], filename, { type: contentType });
      await loadFiles([file]);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <button onClick={handleView}>뷰어로 보기</button>
    </div>
  );
}

function getFilenameFromHeaders(headers: unknown): string | null {
  const getHeader = (name: string): string | undefined => {
    const h: any = headers as any;
    if (h && typeof h.get === "function") {
      const v = h.get(name);
      if (typeof v === "string") return v;
    }
    const v1 = h?.[name.toLowerCase()] ?? h?.[name];
    return typeof v1 === "string" ? v1 : undefined;
  };

  const cd = getHeader("content-disposition");
  if (!cd) return null;

  const starMatch = /filename\*=([^']*)''([^;]+)\s*/i.exec(cd);
  if (starMatch && starMatch[2]) {
    try { return decodeURIComponent(starMatch[2]); } catch { return starMatch[2]; }
  }
  const match = /filename\s*=\s*"?([^";]+)"?/i.exec(cd);
  return match && match[1] ? match[1] : null;
}
