import { create } from "zustand";
import { http } from "../lib/http";

interface LogEntry {
    createdAt: string | Date;
    actor?: string;
    target: string;
    logAction: string;
}

interface LogStore {
    Logs: LogEntry[],
    getLogs: (studyKey: string) => Promise<void>;
}


export const useLogStore = create<LogStore>((set) => ({
    Logs : [],

    getLogs: async () => {
        try{
            const res = await http.get(`/users/logAll`);

            set(() => ({
                Logs: res.data.content
            }))
        } catch (e) {
            console.log("Logs Fetch Error", e);
        }
    },

}))