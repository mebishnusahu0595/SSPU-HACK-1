import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function SatelliteMapView({ propertyId, propertyName, coordinates }) {
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default India
  const [zoom, setZoom] = useState(17);

  useEffect(() => {
    if (coordinates && coordinates[0] && coordinates[0].length > 0) {
      // Calculate center from property coordinates (Leaflet uses [lat, lng])
      const lons = coordinates[0].map(coord => coord[0]);
      const lats = coordinates[0].map(coord => coord[1]);

      const centerLng = (Math.min(...lons) + Math.max(...lons)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

      setCenter([centerLat, centerLng]);
    }
  }, [coordinates]);

  return (
    <div className="w-full h-full relative" style={{ height: '600px' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl shadow-lg z-0"
      >
        <MapUpdater center={center} zoom={zoom} />

        {/* Esri World Imagery (High Res Satellite without API Key) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          maxZoom={19}
        />

        {/* High-res road/label overlay (Optional, but helps with context) */}
        <TileLayer
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png"
          attribution="Map tiles by Stamen Design, CC BY 3.0 &mdash; Map data &copy; OpenStreetMap"
          maxZoom={19}
          opacity={0.4}
        />
        <TileLayer
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          opacity={0.8}
        />

        <Marker position={center}>
          <Popup>
            <strong className="text-gray-800">{propertyName}</strong><br />
            Lat: {center[0].toFixed(6)}<br />
            Lng: {center[1].toFixed(6)}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Property Info Badge */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-10" style={{ pointerEvents: 'none' }}>
        <h3 className="font-bold text-gray-800">{propertyName}</h3>
        <p className="text-sm text-gray-600">
          📍 Lat: {center[0].toFixed(6)}, Lng: {center[1].toFixed(6)}
        </p>
      </div>
    </div>
  );
}
