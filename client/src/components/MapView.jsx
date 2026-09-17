import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BENGALURU_CENTER } from '../utils/constants';

// Build a small colored circular divIcon so we avoid the classic Leaflet + bundler
// "default marker icon path is broken" issue, and get status-colored pins for free.
function buildIcon(color, glyph) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);border:2px solid white;">
      <span style="transform:rotate(45deg);font-size:13px;line-height:1;">${glyph}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

export const ICONS = {
  patient: buildIcon('#0d8aff', '📍'),
  hospitalOpen: buildIcon('#16a34a', 'H'),
  hospitalLimited: buildIcon('#ca8a04', 'H'),
  hospitalFull: buildIcon('#dc2626', 'H'),
  ambulance: buildIcon('#e11d2e', '🚑')
};

export function hospitalIcon(status) {
  if (status === 'Full') return ICONS.hospitalFull;
  if (status === 'Limited Capacity') return ICONS.hospitalLimited;
  return ICONS.hospitalOpen;
}

// Recenters the map imperatively when `center` changes (e.g. after geolocation resolves)
function RecenterOnChange({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapView({ center = BENGALURU_CENTER, zoom = 12, height = '420px', children }) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange center={center} />
        {children}
      </MapContainer>
    </div>
  );
}

export { Marker, Popup };
