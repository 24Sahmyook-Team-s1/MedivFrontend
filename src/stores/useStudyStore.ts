import { create } from "zustand";
import { http } from "../lib/http";
import type { NavigateFunction } from "react-router-dom";

interface StudyStore {
  studyKey: number | null;
  seriesKey: number | null;
  imageKey: number | null;
  studyInsUid: string | null;
  seriesInsUid: string | null;
  StudyList: any[];
  getSeriesList: (patientId: string) => Promise<void>;
  getDicomImage: (
    studyInsUid: string,
    navigate?: NavigateFunction
  ) => Promise<void>;
}

export const useStudyStore = create<StudyStore>((set) => ({
  studyKey: null,
  seriesKey: null,
  imageKey: null,
  studyInsUid: null,
  seriesInsUid: null,

  StudyList: [],

  getSeriesList: async (patientId: string) => {
    try {
      const res = await http.get("/dicom/studies", { params: { patientId } });
      set((state) => ({
        StudyList: [...state.StudyList, res.data],
      }));

      console.log(res);
    } catch (error: any) {
      const status = error?.response?.status;
      console.log(status);
    }
  },

  getDicomImage: async (studyInsUid: string, navigate?) => {
    try {
      const studyRes = await http.get(`/dicom/studies/${studyInsUid}`);
      const seriesInsUid = studyRes.data.seriesInsUid;

      const imageRes = await http.get(`/dicom/series/${seriesInsUid}/images`);

      const files = await Promise.all(
        imageRes.data.map(async (imageInfo: any, idx: number) => {
          const { imageKey, studyKey, seriesKey } = imageInfo;

          // 같은 http 인스턴스를 쓰는 게 CORS/쿠키 일관성에 유리합니다.
          const { data: blob } = await http.get(
            `/dicom/studies/${studyKey}/series/${seriesKey}/images/${imageKey}/stream`,
            { responseType: "blob" }
          );

          // Cornerstone의 fileManager는 File 객체 사용이 안전합니다(Blob도 되지만 name/type이 없는 경우가 있어요).
          return new File([blob], `img_${idx}.dcm`, {
            type: blob.type || "application/dicom",
          });
        })
      );

      // 뷰어로 이동하면서 payload를 함께 전달
      if (navigate) {
        navigate("/viewer", { state: { dicomFiles: files } });
      }
    } catch (error: any) {
      console.log(error);
    }
  },
}));
