"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

export type MapPoint = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  neighborhood?: string | null;
  price?: string;
};

// A simple flame pin so we don't depend on Leaflet's default image assets.
const pin = L.divIcon({
  className: "",
  html: `<div style="font-size:26px;line-height:1;transform:translate(-50%,-100%)">📍</div>`,
  iconSize: [26, 26],
  iconAnchor: [0, 0],
});

const AUSTIN: [number, number] = [30.2672, -97.7431];

export default function RestaurantMap({
  points,
  height = "70vh",
  zoom = 11,
  center,
}: {
  points: MapPoint[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}) {
  const start = center ?? (points.length ? [points[0].lat, points[0].lng] : AUSTIN);

  return (
    <MapContainer
      center={start as [number, number]}
      zoom={zoom}
      scrollWheelZoom
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pin}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>{p.name}</strong>
              {p.neighborhood && (
                <div style={{ color: "#666" }}>{p.neighborhood}</div>
              )}
              {p.price && <div>{p.price}</div>}
              <Link
                href={`/restaurants/${p.slug}`}
                style={{ color: "#c1440e", fontWeight: 600 }}
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
