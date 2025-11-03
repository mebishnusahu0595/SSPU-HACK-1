import { useState, useEffect } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

export default function SatelliteMapView({ propertyId, propertyName, coordinates }) {
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(17);

  useEffect(() => {
    if (coordinates && coordinates[0] && coordinates[0].length > 0) {
      // Calculate center from property coordinates
      const lons = coordinates[0].map(coord => coord[0]);
      const lats = coordinates[0].map(coord => coord[1]);
      
      const centerLng = (Math.min(...lons) + Math.max(...lons)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      
      setCenter({ lat: centerLat, lng: centerLng });
    }
  }, [coordinates]);

  // Your Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  return (
    <div className="w-full h-full">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <div className="relative w-full" style={{ height: '600px' }}>
          <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapTypeId="satellite"
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full rounded-xl shadow-lg"
          >
            {/* Property boundary overlay can be added here */}
          </Map>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 1, 22))}
              className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-lg transition"
            >
              ➕
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
              className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-lg transition"
            >
              ➖
            </button>
          </div>

          {/* Map Type Selector */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
            <select 
              className="px-3 py-2 border-0 focus:outline-none cursor-pointer"
              defaultValue="satellite"
            >
              <option value="satellite">🛰️ Satellite</option>
              <option value="hybrid">🗺️ Hybrid</option>
              <option value="roadmap">🚗 Roadmap</option>
            </select>
          </div>

          {/* Property Info Badge */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
            <h3 className="font-bold text-gray-800">{propertyName}</h3>
            <p className="text-sm text-gray-600">
              📍 Lat: {center.lat.toFixed(6)}, Lng: {center.lng.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Zoom: {zoom}x</p>
          </div>
        </div>
      </APIProvider>
    </div>
  );
}
