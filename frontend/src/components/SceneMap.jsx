import React, { useState } from 'react';
import { 
  Compass, 
  Camera, 
  MapPin, 
  Footprints, 
  Eye, 
  Layers, 
  Crosshair, 
  AlertTriangle 
} from 'lucide-react';

export default function SceneMap({ sceneMarkers = [], caseTitle }) {
  const [selectedMarker, setSelectedMarker] = useState(sceneMarkers[0] || null);
  const [showCameras, setShowCameras] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  return (
    <div className="tactical-panel hud-corner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 22, 0.7)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--accent-cyan)" />
          <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
            2D Tactical Scene Reconstruction Blueprint
          </h4>
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowCameras(!showCameras)}
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            <Camera size={12} color={showCameras ? 'var(--accent-cyan)' : '#64748b'} />
            <span>Cameras</span>
          </button>
          <button
            onClick={() => setShowVectors(!showVectors)}
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            <Footprints size={12} color={showVectors ? 'var(--accent-cyan)' : '#64748b'} />
            <span>Trajectories</span>
          </button>
        </div>
      </div>

      {/* Blueprint Tactical SVG Grid */}
      <div style={{ position: 'relative', flex: 1, minHeight: '340px', background: '#050912', overflow: 'hidden' }}>
        {/* Subtle grid background */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}
        >
          <defs>
            <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f0ff" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />
        </svg>

        {/* Blueprint Floor Layout Outline (Architectural walls) */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Outer Building Envelope */}
          <rect x="8%" y="10%" width="84%" height="80%" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeDasharray="6,4" />
          
          {/* North Sliding Doors Aperture */}
          <line x1="12%" y1="10%" x2="25%" y2="10%" stroke="#00f0ff" strokeWidth="4" />
          <text x="13%" y="8%" fill="#00f0ff" fontSize="10" fontFamily="monospace">NORTH ENTRY</text>

          {/* Cashier Counter Perimeter */}
          <rect x="62%" y="55%" width="22%" height="28%" fill="rgba(30, 41, 59, 0.6)" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="64%" y="53%" fill="#38bdf8" fontSize="10" fontFamily="monospace">REGISTER ZONE</text>

          {/* Center Shelving Rows */}
          <rect x="25%" y="30%" width="28%" height="12%" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(56, 189, 248, 0.2)" />
          <rect x="25%" y="55%" width="28%" height="12%" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(56, 189, 248, 0.2)" />

          {/* Suspect Path Vector Trajectory */}
          {showVectors && (
            <>
              {/* Entry Path */}
              <path
                d="M 180 100 Q 220 280 650 620"
                fill="none"
                stroke="#ff3366"
                strokeWidth="2.5"
                strokeDasharray="5,5"
              />
              {/* Escape Path */}
              <path
                d="M 650 620 Q 400 350 110 90"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              {/* Ballistic Trajectory line */}
              <line x1="650" y1="620" x2="600" y2="480" stroke="#ff3366" strokeWidth="2" strokeDasharray="2,2" />
            </>
          )}

          {/* Camera Vision Cones (FOV) */}
          {showCameras && (
            <>
              {/* Cam 01 North Entrance FOV Cone */}
              <polygon
                points="150,110 80,360 380,300"
                fill="rgba(0, 240, 255, 0.08)"
                stroke="rgba(0, 240, 255, 0.3)"
                strokeWidth="1"
              />
              {/* Cam 02 Register FOV Cone */}
              <polygon
                points="720,600 520,400 580,780"
                fill="rgba(0, 240, 255, 0.08)"
                stroke="rgba(0, 240, 255, 0.3)"
                strokeWidth="1"
              />
            </>
          )}
        </svg>

        {/* Interactive Tactical Markers */}
        {sceneMarkers.map((marker) => {
          const isSelected = selectedMarker?.id === marker.id;
          const isCamera = marker.type === 'camera';
          const isSuspect = marker.type === 'suspect_entry' || marker.type === 'escape_route';
          const isWeapon = marker.type === 'weapon_drop';

          const markerColor = isCamera ? '#00f0ff' : (isWeapon ? '#ff3366' : (isSuspect ? '#f59e0b' : '#10b981'));

          return (
            <div
              key={marker.id}
              onClick={() => setSelectedMarker(marker)}
              style={{
                position: 'absolute',
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 30 : 20,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isSelected ? '32px' : '24px',
                height: isSelected ? '32px' : '24px',
                borderRadius: '50%',
                background: `${markerColor}22`,
                border: `2px solid ${markerColor}`,
                boxShadow: isSelected ? `0 0 15px ${markerColor}` : `0 0 6px ${markerColor}60`,
                transition: 'all 0.2s ease',
              }}>
                {isCamera ? (
                  <Camera size={isSelected ? 16 : 12} color={markerColor} />
                ) : isWeapon ? (
                  <Crosshair size={isSelected ? 16 : 12} color={markerColor} />
                ) : (
                  <MapPin size={isSelected ? 16 : 12} color={markerColor} />
                )}
              </div>

              {/* Marker Label */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#ffffff',
                background: 'rgba(5, 9, 18, 0.85)',
                padding: '1px 5px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                border: `1px solid ${markerColor}40`,
                pointerEvents: 'none',
              }}>
                {marker.label}
              </div>
            </div>
          );
        })}

        {/* Selected Marker Details Drawer at bottom of map */}
        {selectedMarker && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 16, 30, 0.95)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
            zIndex: 40,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {selectedMarker.type.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  {selectedMarker.label}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                {selectedMarker.details}
              </p>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
