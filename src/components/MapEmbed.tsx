"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./RestaurantMap";

// Leaflet touches `window`, so load the map only on the client.
const RestaurantMap = dynamic(() => import("./RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl bg-char/70 text-cream/50"
      style={{ height: "70vh" }}
    >
      Loading map…
    </div>
  ),
});

export function MapEmbed(props: {
  points: MapPoint[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}) {
  return <RestaurantMap {...props} />;
}
