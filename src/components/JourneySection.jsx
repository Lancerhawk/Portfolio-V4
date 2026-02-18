import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useJourneyBookFlip } from '../hooks/useJourneyBookFlip';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: null, iconUrl: null, shadowUrl: null });

function createNeoMarker(location) {
    const el = document.createElement('div');
    el.className = 'neo-marker';
    el.style.cssText = 'position:relative;width:28px;height:28px;';
    el.innerHTML = `
    <div class="neo-marker-label${location.isCurrent ? ' neo-marker-label-current' : ''}">${location.country}</div>
    <div class="neo-marker-pin${location.isCurrent ? ' neo-marker-pin-current' : ''}"></div>
  `;
    return L.divIcon({ html: el.outerHTML, className: 'neo-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
}

function MapController({ flyTo }) {
    const map = useMap();
    useEffect(() => {
        if (flyTo) map.flyTo(flyTo.coords, 6, { animate: true, duration: 1.5 });
    }, [flyTo, map]);
    return null;
}

function MapMarkers({ onLocationClick }) {
    const map = useMap();
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

export default function JourneySection() {
    const { timelineRef, backRef, isOpen } = useJourneyBookFlip();
    const fadeRef = useFadeIn();
    const [flyTo, setFlyTo] = useState(null);

    const handleTimelineClick = (exp) => {
        let loc;
        if (exp.locationId) {
            loc = data.mapLocations.find(l => l.id === exp.locationId);
        }
        if (!loc) {
            loc = data.mapLocations.find(l => l.country === exp.country);
        }
        if (loc) setFlyTo(loc);
    };

    return (
        <section id="experience" style={{ padding: '3rem 2rem', marginBottom: '3rem' }}>
            <div ref={fadeRef} className="section-fade">
                <h2 style={{
                    fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem',
                    letterSpacing: '-0.5px', textTransform: 'uppercase',
                    display: 'inline-block', padding: '0.5rem 1rem',
                    background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                }}>My Journey</h2>

                <div className="journey-container">
                    {/* Timeline (front of book) */}
                    <div ref={timelineRef} className="journey-timeline" style={{
                        background: 'var(--white)', padding: '1.5rem',
                        border: 'var(--border-width) solid var(--border)',
                        boxShadow: isOpen ? '0 8px 0 var(--border)' : '8px 8px 0 var(--border)', height: '600px',
                        position: 'relative', overflowY: 'hidden'
                    }}>
                        <div style={{
                            fontSize: '1.25rem', fontWeight: 700,
                            margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                            padding: '1.5rem 1.5rem 1rem 1.5rem',
                            borderBottom: 'var(--border-width) solid var(--border)',
                            position: 'sticky', top: '-25px', background: 'var(--white)', zIndex: 10
                        }}>
                            🗺️ Career Timeline
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {data.experience.map((exp, i) => (
                                <div key={exp.id} onClick={() => handleTimelineClick(exp)}
                                    style={{
                                        display: 'flex', gap: '1rem', cursor: 'pointer',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            minWidth: '12px', width: '12px', height: '12px',
                                            background: 'var(--border)', border: '2px solid var(--border)',
                                            borderRadius: '50%', marginTop: '0.25rem', position: 'relative', zIndex: 2,
                                            transition: 'all 0.2s ease'
                                        }} />
                                        {i < data.experience.length - 1 && (
                                            <div style={{ width: '2px', flex: 1, background: 'var(--border)', opacity: 0.3, marginTop: '4px' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.4 }}>
                                            {exp.title}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.7, marginBottom: '0.5rem', fontFamily: 'Space Mono, monospace' }}>
                                            {exp.period}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                            {exp.description}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Space Mono, monospace' }}>
                                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)' }} />
                                            {exp.location}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Back of book (treasure map SVG) */}
                    <div ref={backRef} className="journey-timeline-back" style={{
                        background: '#f4ecd8', border: 'var(--border-width) solid var(--border)',
                        boxShadow: isOpen ? '0 8px 0 var(--border)' : '8px 8px 0 var(--border)',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg viewBox="0 0 400 600" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                            <rect width="400" height="600" fill="#f4ecd8" />
                            <path d="M50,100 Q200,50 350,100 Q300,200 350,300 Q200,350 50,300 Q100,200 50,100Z" fill="none" stroke="var(--border)" strokeWidth="3" strokeDasharray="10,5" />
                            <circle cx="200" cy="200" r="30" fill="none" stroke="var(--border)" strokeWidth="3" />
                            <text x="200" y="205" textAnchor="middle" fontFamily="Space Mono" fontSize="20" fill="var(--border)">✕</text>
                            <path d="M50,50 L350,550 M350,50 L50,550" stroke="var(--border)" strokeWidth="1" opacity="0.3" />
                            <text x="200" y="400" textAnchor="middle" fontFamily="Space Grotesk" fontSize="24" fontWeight="700" fill="var(--border)" style={{ textTransform: 'uppercase' }}>Treasure Awaits</text>
                        </svg>
                    </div>

                    {/* Map */}
                    <div className="journey-map-container" style={{
                        border: 'var(--border-width) solid var(--border)',
                        boxShadow: '8px 8px 0 var(--border)', height: '600px',
                        position: 'relative', overflow: 'hidden'
                    }}>
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
                            <MapMarkers onLocationClick={setFlyTo} />
                        </MapContainer>

                        {/* Grid overlay */}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999, opacity: 0.25 }}>
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>

                        {/* Pirate overlay */}
                        <img src="/image/arrow.png" alt="" style={{
                            position: 'absolute', bottom: '-60px', left: '-13px',
                            width: '200px', height: 'auto', zIndex: 1000, pointerEvents: 'none',
                            opacity: 0.5
                        }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
