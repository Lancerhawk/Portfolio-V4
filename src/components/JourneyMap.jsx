import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import data from '../data/portfolio.json';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: null, iconUrl: null, shadowUrl: null });

function createNeoMarker(location) {
    const el = document.createElement('div');
    el.className = 'neo-marker';
    el.style.cssText = 'position:relative;width:28px;height:28px;';
    const labelClass = `neo-marker-label${location.isCurrent ? ' neo-marker-label-current' : ''}${location.labelPosition === 'bottom' ? ' neo-marker-label-bottom' : ''}`;
    el.innerHTML = `
    <div class="${labelClass}">${location.country}</div>
    <div class="neo-marker-pin${location.isCurrent ? ' neo-marker-pin-current' : ''}"></div>
  `;
    return L.divIcon({ html: el.outerHTML, className: 'neo-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
}

function MapController({ flyTo }) {
    const map = useMap();
    useEffect(() => {
        if (flyTo) {
            const zoom = 6;
            const point = map.project(flyTo.coords, zoom);
            point.y -= 150;
            const targetLatLng = map.unproject(point, zoom);
            map.flyTo(targetLatLng, zoom, { animate: true, duration: 1.5 });
        }
    }, [flyTo, map]);
    return null;
}

function MapMarkers({ onLocationClick }) {
    const map = useMap();

    useEffect(() => {
        if (data.mapLocations.length > 0) {
            const bounds = L.latLngBounds(data.mapLocations.map(loc => loc.coords));
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [map]);

    useEffect(() => {
        const markers = [];
        data.mapLocations.forEach(loc => {
            const icon = createNeoMarker(loc);
            const marker = L.marker(loc.coords, { icon }).addTo(map);
            const popupContent = `
        <div class="map-popup">
          <div class="map-popup-country">${loc.country}</div>
          ${loc.companies.map((c, i) => `
            <div class="map-popup-company">
              <strong>${c.company}</strong>
              <span>${c.role}</span>
              <small>${c.city} · ${c.period}</small>
            </div>
            ${i < loc.companies.length - 1 ? '<div class="map-popup-divider"></div>' : ''}
          `).join('')}
        </div>
      `;
            marker.bindPopup(popupContent, { maxWidth: 280 });
            marker.on('click', () => onLocationClick && onLocationClick(loc));
            markers.push(marker);
        });
        return () => markers.forEach(m => m.remove());
    }, [map, onLocationClick]);
    return null;
}

export default function JourneyMap({ flyTo, onLocationClick }) {
    return (
        <MapContainer
            center={data.mapConfig.center}
            zoom={data.mapConfig.zoom}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                url="https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg"
                attribution='&copy; <a href="https://stamen.com">Stamen Design</a>, &copy; <a href="https://www.cooperhewitt.org">Cooper Hewitt</a>'
            />
            <MapController flyTo={flyTo} />
            <MapMarkers onLocationClick={onLocationClick} />
        </MapContainer>
    );
}
