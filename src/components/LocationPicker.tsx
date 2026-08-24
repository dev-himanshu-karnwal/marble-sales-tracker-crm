import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface LatLngValue {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LatLngValue | null;
  onChange: (value: LatLngValue) => void;
  defaultCenter?: LatLngValue;
  height?: number;
}

const pinIcon = L.divIcon({
  className: 'crm-map-marker',
  iconSize: [28, 36],
  iconAnchor: [14, 32],
  html: `<div class="crm-pin architect is-active" style="--pin:#b08d57"><span class="crm-pin-head"></span><span class="crm-pin-shadow"></span></div>`,
});

function ClickHandler({
  onPick,
}: {
  onPick: (v: LatLngValue) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ value }: { value: LatLngValue | null }) {
  const map = useMap();
  useEffect(() => {
    if (!value) return;
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), 13), {
      animate: true,
    });
  }, [value, map]);
  return null;
}

export default function LocationPicker({
  value,
  onChange,
  defaultCenter = { lat: 28.4595, lng: 77.0266 },
  height = 260,
}: LocationPickerProps) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const center = value ?? defaultCenter;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Location is not supported in this browser.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: +pos.coords.latitude.toFixed(6),
          lng: +pos.coords.longitude.toFixed(6),
        });
        setLocating(false);
      },
      () => {
        setGeoError(
          'Could not read current location. Tap the map to place a pin instead.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <div className="location-picker">
      <div className="location-picker-toolbar">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={useCurrentLocation}
          disabled={locating}
        >
          <Crosshair size={14} />
          {locating ? 'Locating…' : 'Use current location'}
        </button>
        <span className="location-picker-hint">
          <MapPin size={13} />
          Or tap the map to drop a pin
        </span>
      </div>

      <div className="location-picker-map" style={{ height }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={value ? 14 : 11}
          scrollWheelZoom
          className="crm-leaflet location-picker-leaflet"
        >
          <TileLayer
            attribution='&copy; OSM · CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <ClickHandler onPick={onChange} />
          <Recenter value={value} />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={pinIcon} />
          )}
        </MapContainer>
      </div>

      {value ? (
        <div className="location-picker-coords">
          Selected: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </div>
      ) : (
        <div className="location-picker-coords is-missing">
          No location selected yet
        </div>
      )}
      {geoError && <div className="location-picker-error">{geoError}</div>}
    </div>
  );
}
