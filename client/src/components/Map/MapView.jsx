import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Maximize2, Minimize2, RotateCw, Move } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MapView = ({ location, markers = [], onLocationClick }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [zoom, setZoom] = useState(13);
  const [tilt, setTilt] = useState(0);
  const [heading, setHeading] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);
  const { theme } = useTheme();

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Sync map center with location prop
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setMapCenter(location);
      setZoom(16);
      if (is3DMode) {
        setTilt(45);
      }
    }
  }, [location, is3DMode]);

  const handleMapClick = (e) => {
    if (e.detail.latLng) {
      const newPos = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
      setClickPosition(newPos);
      if (onLocationClick) {
        onLocationClick(newPos);
      }
    }
  };

  const toggle3DMode = () => {
    if (is3DMode) {
      setTilt(0);
      setHeading(0);
      setIs3DMode(false);
    } else {
      setTilt(45);
      setIs3DMode(true);
    }
  };

  const rotateMap = () => {
    setHeading((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setTilt(0);
    setHeading(0);
    setZoom(13);
  };

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API Key is missing!');
    return (
      <div className="w-full h-full min-h-[300px] bg-surface-elevated flex items-center justify-center rounded-2xl border border-border">
        <div className="text-center p-6 bg-red-500/10 rounded-xl">
          <p className="text-red-500 font-bold mb-2">Google Maps Config Error</p>
          <p className="text-text-secondary text-sm">VITE_GOOGLE_MAPS_API_KEY missing in .env</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="w-full h-full rounded-2xl overflow-hidden relative group">
        <Map
          defaultCenter={mapCenter}
          center={mapCenter}
          defaultZoom={zoom}
          zoom={zoom}
          tilt={tilt}
          heading={heading}
          onCameraChanged={(ev) => {
            setZoom(ev.detail.zoom);
            if (ev.detail.tilt !== undefined) setTilt(ev.detail.tilt);
            if (ev.detail.heading !== undefined) setHeading(ev.detail.heading);
          }}
          mapId="DEMO_MAP_ID"
          onClick={handleMapClick}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            rotateControl: is3DMode,
            tiltControl: is3DMode,
          }}
          mapTypeId={is3DMode ? "satellite" : "roadmap"}
        >
          {/* Render Prop Markers */}
          {markers.map((marker, index) => (
            <AdvancedMarker key={index} position={marker.position}>
              <div
                className={`p-2 rounded-full shadow-lg transform transition-transform hover:scale-110 ${
                  marker.type === 'risk' ? 'bg-red-500' : 'bg-brand-primary'
                }`}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </AdvancedMarker>
          ))}

          {/* Click Marker */}
          {clickPosition && (
            <AdvancedMarker position={clickPosition}>
              <Pin background={'#ef4444'} borderColor={'#b91c1c'} glyphColor={'#ffffff'} />
            </AdvancedMarker>
          )}
        </Map>

        {/* 3D Controls - Left Side */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <button
            onClick={toggle3DMode}
            className={`bg-surface/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg hover:bg-surface transition-all ${
              is3DMode ? 'ring-2 ring-brand-primary' : ''
            }`}
            title={is3DMode ? 'Switch to 2D' : 'Switch to 3D'}
          >
            {is3DMode ? (
              <Minimize2 className="h-5 w-5 text-brand-primary" />
            ) : (
              <Maximize2 className="h-5 w-5 text-text-secondary" />
            )}
          </button>
          
          {is3DMode && (
            <>
              <button
                onClick={rotateMap}
                className="bg-surface/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg hover:bg-surface transition-all"
                title="Rotate 90°"
              >
                <RotateCw className="h-5 w-5 text-text-secondary" />
              </button>
              
              <button
                onClick={resetView}
                className="bg-surface/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg hover:bg-surface transition-all"
                title="Reset View"
              >
                <Move className="h-5 w-5 text-text-secondary" />
              </button>
            </>
          )}
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md border border-border rounded-lg px-4 py-2 shadow-lg z-10">
          <p className="text-xs text-text-secondary flex items-center gap-2">
            <MapPin className="h-3 w-3 text-brand-primary" />
            {is3DMode ? '3D View Active - Click to analyze' : 'Click anywhere to analyze'}
          </p>
        </div>

        {/* 3D Mode Badge - Top Right */}
        {is3DMode && (
          <div className="absolute top-4 right-4 bg-brand-primary/90 backdrop-blur-md rounded-lg px-3 py-1 shadow-lg z-10">
            <p className="text-xs font-bold text-white">3D PHOTOREALISTIC</p>
          </div>
        )}
      </div>
    </APIProvider>
  );
};

export default MapView;
