import { create } from "zustand";
import { http } from "../lib/http";
import type { NavigateFunction } from "react-router-dom";

interface StudyStore {
  studyKey: number | null;
  seriesKey: number | null;
  imageKey: number | null;
  studyInsUid: string | null;
  seriesInsUids: string[] | null;
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
  seriesInsUids: null,

  StudyList: [],

  getSeriesList: async (patientId: string) => {
    try {
      const res = await http.get("/dicom/studies", { params: { patientId } });
      set(() => ({
        StudyList: [res.data],
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
    const seriesInsUid = studyRes.data.map((item: { seriesInsUid: string; }) => item.seriesInsUid);

    const imageRes: any[] = [];

    for (let i = 0; i < seriesInsUid.length; i++){
      imageRes[i] = await http.get(`/dicom/series/${seriesInsUid[i]}/images`)
    }

    // 시리즈별로 파일을 저장할 이차원 배열
    const filesBySeries: File[][] = [];

    for (let seriesIdx = 0; seriesIdx < imageRes.length; seriesIdx++) {
      const imagesInSeries = imageRes[seriesIdx].data;
      
      // 현재 시리즈의 파일들을 저장할 배열
      const seriesFiles = await Promise.all(
        imagesInSeries.map(async (imageInfo: any, imageIdx: number) => {
          const { imageKey, studyKey, seriesKey } = imageInfo;

          const { data: blob } = await http.get(
            `/dicom/studies/${studyKey}/series/${seriesKey}/images/${imageKey}/stream`,
            { responseType: "blob" }
          );

          return new File([blob], `series_${seriesIdx}_img_${imageIdx}.dcm`, {
            type: blob.type || "application/dicom",
          });
        })
      );

      // 시리즈별로 저장
      filesBySeries[seriesIdx] = seriesFiles;
    }

    // 모든 파일을 하나의 배열로 합치기 (기존 방식 유지)
    const allFiles = filesBySeries.flat();

    // 뷰어로 이동하면서 payload를 함께 전달
    if (navigate) {
      navigate("/viewer", { 
        state: { 
          dicomFiles: allFiles,
          filesBySeries: filesBySeries // 시리즈별 구분된 파일도 함께 전달
        } 
      });
    }
  } catch (error: any) {
    console.log(error);
  }
},
}));
