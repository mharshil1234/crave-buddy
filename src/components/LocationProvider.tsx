"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/stores/locationStore";

export function LocationProvider() {
    const setLocation = useLocationStore(
        (state) => state.setLocation
    );

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation(
                position.coords.latitude.toString(),
                position.coords.longitude.toString()
            );
        });
    }, [setLocation]);

    return null;
}