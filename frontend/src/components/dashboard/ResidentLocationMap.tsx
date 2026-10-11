"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ResidentLocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

const getPinIcon = () => {
  return L.divIcon({
    html: '<div style="width: 18px; height: 18px; background: #EF4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);"></div>',
    className: "custom-resident-pin",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export default function ResidentLocationMap({ latitude, longitude, name }: ResidentLocationMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-card-border relative z-10">
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={getPinIcon()}>
          <Popup>
            <div className="text-xs font-bold text-foreground p-1">
              <span>{name}'s Registered Coordinates</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
