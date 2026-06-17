import { create } from "zustand";

type LocationStore = {
    lat: string;
    lng: string;
    setLocation: (lat: string, lng: string) => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
    lat: "",
    lng: "",
    setLocation: (lat, lng) => set({ lat, lng }),
}));