import { create } from "zustand";
import { http } from "../lib/http";




interface ReportStore {
    CurrentReport: string | null,
    getReport: (studyKey: string) => Promise<void>;
    setReport: (report: string) => void;
}


export const useReportStore = create<ReportStore>((set, get) => ({
    CurrentReport : null,

    getReport: async (studyKey: string) => {
        try{
            const res = await http.get(`/reports/study/${studyKey}`);

            set(() => ({
                CurrentReport: res.data.content
            }))
        } catch (e) {
            console.log("Report Fetch Error", e);
        }
    },

    setReport: (report: string) => {
        try{
            set(() => ({
                CurrentReport: report
            }))
        } catch (e) {
            console.log("Report Set Error", e)
        }
    },

    postReport: async (studyKey: string) => {
        const { CurrentReport } = get();

        try{
            await http.post("reports", {params: {studyKey, content: CurrentReport}});
        } catch (e) {
            console.log("Report Post Error", e);
        }
    }

}))