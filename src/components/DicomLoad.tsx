import axios from "axios";

export default function DicomLoad() {
  async function handleDownload() {
    try {
      const res = await axios.get(
        "",
        {
          responseType: "blob",
        }
      );

      const contentType =
        (res.headers?.["content-type"] as string) || "application/dicom";
      const filename = getFilenameFromHeaders(res.headers) || "download.dcm";

      triggerDownload(res.data, filename, contentType);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <button onClick={handleDownload}>다운로드</button>
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string, type: string) {
  const file = new Blob([blob], { type });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
    try {
      return decodeURIComponent(starMatch[2]);
    } catch {
      return starMatch[2];
    }
  }

  const match = /filename\s*=\s*"?([^";]+)"?/i.exec(cd);
  return match && match[1] ? match[1] : null;

}
