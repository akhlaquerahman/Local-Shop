import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, LocateFixed } from 'lucide-react';
import { api as axios } from '@/lib/axios';

// Fix default leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (data: { lat: number, lng: number, address: any }) => void;
}

const MapEvents = ({ setPosition }: { setPosition: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

const MapUpdater = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addressPreview, setAddressPreview] = useState('Select a location on the map');

  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi

  const handlePositionChange = useCallback(async (latlng: L.LatLng) => {
    setPosition(latlng);
    try {
      const res = await axios.get(`/shops/reverse-geocode?lat=${latlng.lat}&lng=${latlng.lng}`);
      if (res.data.success && res.data.data) {
        const addr = res.data.data.address || {};
        const formatted = res.data.data.display_name;
        setAddressPreview(formatted);
        onLocationSelect({
          lat: latlng.lat,
          lng: latlng.lng,
          address: {
            fullAddress: formatted,
            city: addr.city || addr.town || addr.village,
            state: addr.state,
            country: addr.country,
            postalCode: addr.postcode
          }
        });
      }
    } catch (e) {
      console.error('Reverse Geocode error', e);
    }
  }, [onLocationSelect]);

  useEffect(() => {
    if (position && !addressPreview.includes(position.lat.toString().substring(0,4))) {
      // initial load
      handlePositionChange(position);
    }
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          handlePositionChange(latlng);
        },
        (err) => {
          alert('Unable to retrieve your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`/shops/search-location?q=${encodeURIComponent(searchQuery)}`);
      if (res.data.success) {
        setSearchResults(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const latlng = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
    setSearchQuery(result.display_name);
    setSearchResults([]);
    handlePositionChange(latlng);
  };

  return (
    <div className="flex flex-col gap-4 border border-border rounded-xl p-4 bg-surface">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div 
                  key={idx} 
                  className="p-3 hover:bg-background cursor-pointer border-b border-border last:border-0 text-sm"
                  onClick={() => selectSearchResult(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>

        <button 
          onClick={getCurrentLocation}
          className="px-4 py-2 border border-border bg-background text-text rounded-lg text-sm font-medium hover:bg-surface flex items-center gap-2 transition-colors"
        >
          <LocateFixed className="w-4 h-4 text-primary" />
          Current Location
        </button>
      </div>

      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border relative z-0">
        <MapContainer 
          center={position ? [position.lat, position.lng] : defaultCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <>
              <Marker 
                position={position} 
                draggable={true} 
                eventHandlers={{
                  dragend: (e) => handlePositionChange(e.target.getLatLng())
                }}
              />
              <MapUpdater position={[position.lat, position.lng]} />
            </>
          )}
          <MapEvents setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-text">Selected Location</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{addressPreview}</p>
          {position && (
            <p className="text-xs font-mono text-primary/70 mt-1">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
