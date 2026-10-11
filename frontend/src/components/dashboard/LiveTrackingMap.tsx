"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BinLocation, Driver } from "@/store/greenCityStore";

interface LiveTrackingMapProps {
  bins?: BinLocation[];
  drivers?: Driver[];
  selectedBin?: BinLocation | null;
  drawRouteForDriverId?: string;
}

type MarkerType = "Pending" | "Completed" | "Truck" | "TruckStale" | "SelectedRoute";

const LIVE_SECONDS = 60;
const HIDE_MINUTES = 30;
const DEFAULT_CENTER: [number, number] = [6.9934, 81.0550];

const iconCache: Partial<Record<MarkerType, L.DivIcon>> = {};

const getMarkerIcon = (type: MarkerType) => {
  const cached = iconCache[type];
  if (cached) return cached;

  let color = "#F59E0B";
  let iconHtml = '<div style="width: 14px; height: 14px; background: currentColor; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>';

  if (type === "Completed") {
    color = "#10B981";
  } else if (type === "Truck" || type === "TruckStale") {
    color = type === "Truck" ? "#3B82F6" : "#94A3B8";
    iconHtml = `
      <div style="width: 24px; height: 24px; background: ${color}; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
      </div>
    `;
  } else if (type === "SelectedRoute") {
    color = "#EF4444";
    iconHtml = '<div style="width: 16px; height: 16px; background: #EF4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>';
  }

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: ${color};">
      ${
        type === "Pending"
          ? `<div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.25; transform: scale(1.3); animation: pulse-soft 2.5s infinite;"></div>`
          : ""
      }
      ${iconHtml}
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  iconCache[type] = icon;
  return icon;
};

function formatAgo(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return seconds + " s ago";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes + " min ago";
  return Math.round(minutes / 60) + " h ago";
}

function RecenterMap({ bin }: { bin?: BinLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (bin) {
      map.setView([bin.latitude, bin.longitude], 15, { animate: true });
    }
  }, [bin, map]);
  return null;
}

export default function LiveTrackingMap({
  bins = [],
  drivers = [],
  selectedBin = null,
  drawRouteForDriverId,
}: LiveTrackingMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  const trucks = useMemo(() => {
    return drivers
      .filter(
        (d) =>
          d.status === "Online" &&
          Number.isFinite(d.latitude) &&
          Number.isFinite(d.longitude)
      )
      .map((d) => {
        const updated = d.locationUpdatedAt ? new Date(d.locationUpdatedAt).getTime() : NaN;
        const age = Number.isFinite(updated) ? Date.now() - updated : Infinity;
        return { driver: d, age };
      })
      .filter((t) => t.age < HIDE_MINUTES * 60000);
  }, [drivers]);

  const routePoints = useMemo(() => {
    if (!drawRouteForDriverId) return [];
    const driver = drivers.find((d) => d.id === drawRouteForDriverId);
    const startPoint: [number, number] =
      driver && Number.isFinite(driver.latitude) && Number.isFinite(driver.longitude)
        ? [driver.latitude as number, driver.longitude as number]
        : DEFAULT_CENTER;
    const assignedBins = bins.filter(
      (b) => b.assignedDriverId === drawRouteForDriverId && b.status !== "Collected"
    );
    const points: [number, number][] = [startPoint];
    assignedBins.forEach((b) => points.push([b.latitude, b.longitude]));
    return points.length > 1 ? points : [];
  }, [bins, drivers, drawRouteForDriverId]);

  const fitAll = () => {
    if (!map) return;
    const points: [number, number][] = [
      ...bins.map((b) => [b.latitude, b.longitude] as [number, number]),
      ...trucks.map((t) => [t.driver.latitude as number, t.driver.longitude as number] as [number, number]),
    ];
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
  };

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-card-border shadow-md min-h-[380px]">
      <MapContainer
        ref={setMap}
        center={DEFAULT_CENTER}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap bin={selectedBin} />

        {bins.map((bin) => {
          const isSelected = selectedBin && selectedBin.id === bin.id;
          const markerType: MarkerType = isSelected
            ? "SelectedRoute"
            : bin.status === "Collected"
            ? "Completed"
            : "Pending";

          return (
            <Marker
              key={bin.id}
              position={[bin.latitude, bin.longitude]}
              icon={getMarkerIcon(markerType)}
            >
              <Popup>
                <div className="p-1 flex flex-col gap-0.5 text-[11px] font-sans">
                  <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-1 mb-1">
                    <span className="font-extrabold text-foreground uppercase">
                      {bin.wasteType}
                    </span>
                    <span
                      style={{
                        color:
                          bin.status === "Pending"
                            ? "#F59E0B"
                            : bin.status === "Assigned"
                            ? "#3B82F6"
                            : "#10B981",
                      }}
                      className="font-bold text-[10px]"
                    >
                      {bin.status}
                    </span>
                  </div>
                  <p className="text-muted-text">
                    <span className="font-bold text-foreground">Address:</span> {bin.address}
                  </p>
                  <p className="text-muted-text">
                    <span className="font-bold text-foreground">Reporter:</span> {bin.reporterName}
                  </p>
                  {bin.weightKg && (
                    <p className="text-emerald-600 font-bold">
                      Weight: {bin.weightKg} Kg
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {trucks.map(({ driver, age }) => {
          const live = age < LIVE_SECONDS * 1000;
          return (
            <Marker
              key={driver.id}
              position={[driver.latitude as number, driver.longitude as number]}
              icon={getMarkerIcon(live ? "Truck" : "TruckStale")}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="p-1 flex flex-col gap-0.5 text-[11px] font-sans">
                  <h5 className="font-bold text-foreground">{driver.name}</h5>
                  <p className="text-muted-text">Truck: {driver.vehicleNo}</p>
                  <p className="text-muted-text">Updated: {formatAgo(age)}</p>
                  <span
                    style={{ color: live ? "#3B82F6" : "#94A3B8" }}
                    className="text-[9px] font-bold"
                  >
                    {live ? "Live" : "Last seen"}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {routePoints.length > 0 && (
          <Polyline positions={routePoints} color="#EF4444" weight={4} dashArray="5, 10" />
        )}
      </MapContainer>

      <button
        type="button"
        onClick={fitAll}
        className="absolute top-4 right-4 z-20 bg-card-bg/95 backdrop-blur-md border border-card-border px-3 py-1.5 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-wider text-foreground cursor-pointer hover:border-primary-green"
      >
        Show all
      </button>

      <div className="absolute bottom-4 left-4 z-20 bg-card-bg/95 backdrop-blur-md border border-card-border p-3.5 rounded-2xl shadow-lg flex flex-col gap-2 text-[10px] font-bold text-foreground max-w-[220px]">
        <div className="text-[9px] uppercase tracking-wider text-muted-text border-b border-card-border pb-1 mb-0.5">
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block border border-white" />
          <span>Green = Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block border border-white" />
          <span>Orange = Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block border border-white" />
          <span>Blue = Truck (live)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8] inline-block border border-white" />
          <span>Grey = Truck (last seen)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block border border-white" />
          <span>Red = Selected Route</span>
        </div>
      </div>
    </div>
  );
}