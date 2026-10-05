"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// Cebu City, where most of Nook's cafes are.
const DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];

// The same box submit_cafe_listing enforces, so a pin outside it is caught
// here rather than as a server error.
export function inPhilippines(lat: number, lng: number) {
  return lat >= 4 && lat <= 22 && lng >= 116 && lng <= 127.5;
}

export type Pin = { lat: number; lng: number };

// For a cafe address search can't find: the owner taps the map (or drags the
// pin, or uses their location when standing in the cafe). Tapping is the
// non-drag way to place it (WCAG 2.5.7). Needs NEXT_PUBLIC_MAPBOX_TOKEN for
// the tiles; without it the form never reaches this.
export function PinPicker({
  pin,
  onChange,
}: {
  pin: Pin | null;
  onChange: (pin: Pin) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  // Set once the map loads: drops or moves the pin and reports it.
  const placeRef = useRef<((lng: number, lat: number) => void) | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // mapbox-gl touches window on import, so it's loaded here, client-side, and
  // only when the owner opens the pin option.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !container.current || map.current) return;
    let cancelled = false;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !container.current) return;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const instance = new mapboxgl.Map({
        container: container.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: pin ? [pin.lng, pin.lat] : DEFAULT_CENTER,
        zoom: pin ? 16 : 12,
        cooperativeGestures: true,
      });
      instance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      const place = (lng: number, lat: number) => {
        if (!marker.current) {
          marker.current = new mapboxgl.Marker({ color: "#3A5A40", draggable: true })
            .setLngLat([lng, lat])
            .addTo(instance);
          marker.current.on("dragend", () => {
            const at = marker.current!.getLngLat();
            onChangeRef.current({ lat: at.lat, lng: at.lng });
          });
        } else {
          marker.current.setLngLat([lng, lat]);
        }
        onChangeRef.current({ lat, lng });
      };

      placeRef.current = place;
      if (pin) place(pin.lng, pin.lat);
      instance.on("click", (e) => place(e.lngLat.lng, e.lngLat.lat));
      map.current = instance;
    });

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
      placeRef.current = null;
    };
    // The map is built once; later pin changes come from the map itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Your browser can't share your location. Tap the map instead.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const { latitude: lat, longitude: lng } = coords;
        map.current?.flyTo({ center: [lng, lat], zoom: 17 });
        placeRef.current?.(lng, lat);
      },
      () => {
        setLocating(false);
        setLocateError("Couldn't get your location. Tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="mt-3">
      <div
        ref={container}
        role="application"
        aria-label="Map. Tap where your cafe is to place the pin, or drag the pin to move it."
        className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[var(--nk-line)] bg-[var(--nk-bg-2)] sm:aspect-[16/9]"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-[var(--nk-muted)]">
        <span aria-live="polite">
          {pin ? "Pin placed. Drag it or tap again to adjust." : "Tap the map where your cafe is."}
        </span>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="min-h-6 font-semibold text-[var(--nk-green)] hover:underline disabled:opacity-60"
        >
          {locating ? "Finding you…" : "I'm at the cafe, use my location"}
        </button>
      </div>
      {locateError ? (
        <p role="alert" className="mt-1 text-xs text-[#b94a48]">
          {locateError}
        </p>
      ) : null}
    </div>
  );
}
