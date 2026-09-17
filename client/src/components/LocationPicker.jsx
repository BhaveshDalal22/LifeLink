import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { Marker, Popup, ICONS } from './MapView';

// Click-to-select marker used as a manual fallback when geolocation is unavailable/denied
export default function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  if (!position) return null;
  return (
    <Marker position={[position.lat, position.lng]} icon={ICONS.patient}>
      <Popup>Selected location</Popup>
    </Marker>
  );
}
