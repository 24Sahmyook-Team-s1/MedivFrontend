// src/api/dicom.ts
export async function fetchInstanceUrls(seriesId: string): Promise<string[]> {
  const res = await fetch(`/api/series/${seriesId}/instances`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load instance list');
  const urls = await res.json(); // string[]
  if (!Array.isArray(urls)) throw new Error('Invalid instance list response');
  return urls;
}

export async function fetchBlobs(urls: string[]): Promise<Blob[]> {
  const blobs: Blob[] = [];
  for (const u of urls) {
    const r = await fetch(u, { method: 'GET' });
    if (!r.ok) throw new Error(`Failed to fetch DICOM: ${u}`);
    blobs.push(await r.blob());
  }
  return blobs;
}
