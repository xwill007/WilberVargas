import React from 'react';
import ARSoverlayList from './ARSoverlayList';
import ARSHelpTooltip from './ARSHelpTooltip';
import OverlayDropdownMenu from './OverlayDropdownMenu';
import arsConfigManager from '../../../config/ARSConfigManager';

/**
 * ARSConfig
 * Menú de configuración para la vista ARS (zoom, separación, ancho, alto, offset, resolución, overlays) + lista de overlays.
 * Props:
 *  - arSeparation, setArSeparation
 *  - arWidth, setArWidth
 *  - arHeight, setArHeight
 *  - offsetL, setOffsetL
 *  - offsetR, setOffsetR
 *  - scale, setScale
 *  - cameraZoom, setCameraZoom
 *  - cameraResolution, setCameraResolution
 *  - onCameraResolutionChange: función para cambiar la resolución de la cámara
 *  - showMenu, setShowMenu
 *  - selectedOverlay, setSelectedOverlay
 *  - overlays
 *  - onSave: función para guardar en localStorage
 *  - position: objeto con propiedades de posición { button: {}, menu: {} }
 */
const ARSConfig = ({
  arSeparation, setArSeparation,
  arWidth, setArWidth,
  arHeight, setArHeight,
  offsetL, setOffsetL,
  offsetR, setOffsetR,
  scale, setScale,
  cameraZoom, setCameraZoom,
  cameraResolution, setCameraResolution,
  onCameraResolutionChange,
  showMenu, setShowMenu,
  selectedOverlay, setSelectedOverlay,
  overlays,
  onSave,
  position = {
    button: { top: 12, left: 6 },
    menu: { top: 90, left: 270 }
  }
}) => {
  const [showHelp, setShowHelp] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('config'); // 'config' o 'overlays'
  const [selectedOverlays, setSelectedOverlays] = React.useState([]);
  const [overlayConfigPanelOpen, setOverlayConfigPanelOpen] = React.useState(null);

  // Cargar overlays seleccionados al montar el componente
  React.useEffect(() => {
    try {
      const savedOverlays = arsConfigManager.loadSelectedOverlays();
      setSelectedOverlays(savedOverlays);
    } catch (error) {
      console.error('Error cargando overlays:', error);
    }
  }, []);

  // Opciones de resolución disponibles
  const resolutionOptions = [
    { label: '480p', value: '480p', width: 640, height: 480 },
    { label: '720p', value: '720p', width: 1280, height: 720 },
    { label: '1080p', value: '1080p', width: 1920, height: 1080 },
    { label: '4K', value: '4K', width: 3840, height: 2160 }
  ];

  // Función para cambiar la resolución de la cámara
  const handleResolutionChange = (newResolution) => {
    setCameraResolution(newResolution);
    if (onCameraResolutionChange) {
      onCameraResolutionChange(newResolution);
    }
  };

  // Función para aplicar presets usando el manager
  const applyPreset = async (presetName) => {
    try {
      const preset = await arsConfigManager.applyPreset(presetName);
      // Actualizar los estados locales incluyendo la resolución de cámara
      setArSeparation(preset.arSeparation);
      setArWidth(preset.arWidth);
      setArHeight(preset.arHeight);
      setOffsetL(preset.offsetL);
      setOffsetR(preset.offsetR);
      setScale(preset.scale);
      
      // Actualizar zoom de cámara si está en el preset
      if (preset.cameraZoom) {
        setCameraZoom(preset.cameraZoom);
      }
      
      // Actualizar resolución de cámara si está en el preset
      if (preset.cameraResolution) {
        setCameraResolution(preset.cameraResolution);
        if (onCameraResolutionChange) {
          onCameraResolutionChange(preset.cameraResolution);
        }
      }
      
      console.log(`✅ Preset ${presetName} aplicado:`, preset);
    } catch (error) {
      console.error(`❌ Error aplicando preset ${presetName}:`, error);
    }
  };

  // Funciones para manejar overlays
  const handleOverlayToggle = (overlayKey) => {
    console.log('🔄 Toggle overlay:', overlayKey);
    
    const newSelectedOverlays = selectedOverlays.includes(overlayKey)
      ? selectedOverlays.filter(key => key !== overlayKey)
      : [...selectedOverlays, overlayKey];
    
    setSelectedOverlays(newSelectedOverlays);
    
    // Guardar en el manager
    try {
      arsConfigManager.saveSelectedOverlays(newSelectedOverlays);
      console.log('✅ Overlays guardados:', newSelectedOverlays);
    } catch (error) {
      console.error('❌ Error guardando overlays:', error);
    }
  };

  const handleClearAllOverlays = () => {
    console.log('🧹 Limpiando todos los overlays');
    setSelectedOverlays([]);
    try {
      arsConfigManager.saveSelectedOverlays([]);
      console.log('✅ Todos los overlays limpiados');
    } catch (error) {
      console.error('❌ Error limpiando overlays:', error);
    }
  };

  const handleResetToDefaults = () => {
    console.log('🔄 Reseteando overlays a defaults');
    try {
      const defaultOverlays = arsConfigManager.getDefaultOverlays();
      setSelectedOverlays(defaultOverlays);
      arsConfigManager.saveSelectedOverlays(defaultOverlays);
      console.log('✅ Overlays reseteados a defaults:', defaultOverlays);
    } catch (error) {
      console.error('❌ Error reseteando overlays:', error);
    }
  };

  const handleConfigureOverlay = (overlayKey) => {
    console.log('⚙️ Configurando overlay:', overlayKey);
    setOverlayConfigPanelOpen(overlayKey);
  };
  // Estilos por defecto del botón
  const defaultButtonStyle = {
    position: 'absolute',
    top: position.button.top || 12,
    left: position.button.left || 6,
    right: position.button.right,
    bottom: position.button.bottom,
    zIndex: 3200,
    background: showMenu ? 'rgba(79,195,247,0.9)' : 'rgba(30,30,30,0.85)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: 18,
    height: 18,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px #000a',
    transition: 'all 0.3s ease',
  };

  // Estilos por defecto del menú
  const defaultMenuStyle = {
    position: 'absolute',
    top: position.menu.top || 90,
    left: position.menu.left || 270,
    right: position.menu.right,
    bottom: position.menu.bottom,
    zIndex: 3100,
    background: 'rgba(20,20,20,0.96)',
    color: 'white',
    borderRadius: 12,
    padding: '12px 20px',
    fontSize: 14,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 280,
    border: '1px solid rgba(79,195,247,0.3)'
  };

  return (
    <>
      {/* Botón X para mostrar/ocultar menú */}
      <button
        style={defaultButtonStyle}
        onClick={() => setShowMenu((v) => !v)}
        aria-label={showMenu ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {showMenu ? '✕' : '☰'}
      </button>
      {showMenu && (
        <div style={defaultMenuStyle}>
          {/* Pestañas del menú */}
          <div style={{ 
            display: 'flex', 
            marginBottom: 12, 
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: 8
          }}>
            <button
              onClick={() => setActiveTab('config')}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: activeTab === 'config' ? '#4fc3f7' : 'rgba(79,195,247,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                borderBottom: activeTab === 'config' ? 'none' : '1px solid rgba(255,255,255,0.2)'
              }}
            >
              🎛️ Configuración
            </button>
            <button
              onClick={() => setActiveTab('overlays')}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: activeTab === 'overlays' ? '#4fc3f7' : 'rgba(79,195,247,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                borderBottom: activeTab === 'overlays' ? 'none' : '1px solid rgba(255,255,255,0.2)'
              }}
            >
              📋 Overlays ({selectedOverlays.length})
            </button>
          </div>

          {/* Contenido de la pestaña Configuración */}
          {activeTab === 'config' && (
            <div>
              {/* Título de sección con botón de ayuda */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 8 
              }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#4fc3f7' }}>
                  Configuración Estereoscópica AR
                </div>
                <button
                  onClick={() => setShowHelp(true)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(79,195,247,0.5)',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    color: '#4fc3f7',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Ayuda"
                >
                  ?
                </button>
              </div>
              
              {/* Control de resolución de cámara */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>📹 Resolución</span>
                <select 
                  value={cameraResolution} 
                  onChange={e => handleResolutionChange(e.target.value)}
                  style={{ 
                    flex: 1, 
                    background: 'rgba(40,40,40,0.9)', 
                    color: 'white', 
                    border: '1px solid rgba(79,195,247,0.3)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 12
                  }}
                >
                  {resolutionOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ background: '#333' }}>
                      {option.label} ({option.width}x{option.height})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Controles de configuración */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>📐 Separación</span>
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  step="2"
                  value={arSeparation} 
                  onChange={e => setArSeparation(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#4fc3f7' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{arSeparation}px</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>📏 Ancho</span>
                <input 
                  type="range" 
                  min="200" 
                  max="600" 
                  step="10"
                  value={arWidth} 
                  onChange={e => setArWidth(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#4fc3f7' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{arWidth}px</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>📐 Alto</span>
                <input 
                  type="range" 
                  min="200" 
                  max="700" 
                  step="10"
                  value={arHeight} 
                  onChange={e => setArHeight(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#4fc3f7' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{arHeight}px</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>⬅️ Offset I</span>
                <input 
                  type="range" 
                  min="-300" 
                  max="300" 
                  step="5"
                  value={offsetL} 
                  onChange={e => setOffsetL(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#ff7043' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{offsetL}px</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>➡️ Offset D</span>
                <input 
                  type="range" 
                  min="-300" 
                  max="300" 
                  step="5"
                  value={offsetR} 
                  onChange={e => setOffsetR(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#ff7043' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{offsetR}px</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>� Escala</span>
                <input 
                  type="range" 
                  min="0.3" 
                  max="3" 
                  step="0.05" 
                  value={scale} 
                  onChange={e => setScale(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#66bb6a' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{scale.toFixed(2)}x</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ minWidth: 90, fontSize: 13 }}>🔍 Zoom Cámara</span>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.1" 
                  value={cameraZoom} 
                  onChange={e => setCameraZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#ff9800' }}
                />
                <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{cameraZoom.toFixed(1)}x</span>
              </div>
              
              {/* Botones de presets */}
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  style={{
                    background: '#4fc3f7',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    flex: 1,
                    minWidth: 60
                  }}
                  onClick={() => applyPreset('mobile')}
                >
                  📱 Móvil
                </button>
                <button
                  style={{
                    background: '#66bb6a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    flex: 1,
                    minWidth: 60
                  }}
                  onClick={() => applyPreset('desktop')}
                >
                  💻 Desktop
                </button>
                <button
                  style={{
                    background: '#ff7043',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    flex: 1,
                    minWidth: 60
                  }}
                  onClick={() => applyPreset('vr')}
                >
                  🥽 VR
                </button>
              </div>
              
              {/* Botón Guardar configuración */}
              <button
                style={{
                  marginTop: 15,
                  background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(79,195,247,0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                onClick={() => {
                  onSave();
                  // Feedback visual
                  const button = event.target;
                  const originalText = button.innerHTML;
                  button.innerHTML = '✓ Guardado';
                  button.style.background = 'linear-gradient(135deg, #66bb6a, #4caf50)';
                  setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = 'linear-gradient(135deg, #4fc3f7, #29b6f6)';
                  }, 1500);
                }}
              >
                💾 Guardar Configuración
              </button>
            </div>
          )}

          {/* Contenido de la pestaña Overlays */}
          {activeTab === 'overlays' && (
            <div>
              <div style={{ 
                marginBottom: 12, 
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ color: '#4fc3f7', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                  � Selección de Overlays
                </div>
                <div style={{ color: '#bbb', fontSize: 11 }}>
                  Activa/desactiva los overlays para tu experiencia AR
                </div>
              </div>
              
              {/* Componente de selección de overlays integrado */}
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: 8, 
                padding: '8px',
                border: '1px solid rgba(79,195,247,0.2)'
              }}>
                <OverlayDropdownMenu
                  selectedOverlays={selectedOverlays}
                  onOverlayToggle={handleOverlayToggle}
                  onClearAll={handleClearAllOverlays}
                  onResetToDefaults={handleResetToDefaults}
                  onConfigureOverlay={handleConfigureOverlay}
                  multiSelect={true}
                />
              </div>
              
              {/* Estadísticas de overlays */}
              <div style={{ 
                marginTop: 12, 
                padding: '8px 12px',
                background: 'rgba(79,195,247,0.1)',
                borderRadius: 6,
                fontSize: 12
              }}>
                <div style={{ color: '#4fc3f7', fontWeight: 'bold', marginBottom: 4 }}>
                  📊 Estadísticas
                </div>
                <div style={{ color: '#bbb' }}>
                  Overlays activos: <span style={{ color: '#00ff88' }}>{selectedOverlays.length}</span>
                </div>
                <div style={{ color: '#bbb', fontSize: 10, marginTop: 2 }}>
                  {selectedOverlays.length > 0 ? selectedOverlays.join(', ') : 'Ningún overlay seleccionado'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Componente de ayuda */}
      <ARSHelpTooltip 
        show={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
      
      {/* Panel de configuración de overlay específico */}
      {overlayConfigPanelOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 4000,
          background: 'rgba(20,20,20,0.98)',
          color: 'white',
          borderRadius: 12,
          padding: 20,
          border: '2px solid #4fc3f7',
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          minWidth: 300,
          maxWidth: 500
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
            borderBottom: '1px solid rgba(79,195,247,0.3)',
            paddingBottom: 8
          }}>
            <h3 style={{ margin: 0, color: '#4fc3f7' }}>
              ⚙️ Configurar: {overlayConfigPanelOpen}
            </h3>
            <button
              onClick={() => setOverlayConfigPanelOpen(null)}
              style={{
                background: 'transparent',
                border: '1px solid #ff4444',
                borderRadius: '50%',
                width: 24,
                height: 24,
                color: '#ff4444',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ color: '#bbb', fontSize: 14 }}>
            Panel de configuración para el overlay <strong>{overlayConfigPanelOpen}</strong>
          </div>
          
          <div style={{ 
            marginTop: 16,
            padding: 12,
            background: 'rgba(79,195,247,0.1)',
            borderRadius: 6,
            fontSize: 12,
            color: '#4fc3f7'
          }}>
            <strong>💡 Próximamente:</strong> Configuración de posición, tamaño, transparencia y otros parámetros específicos del overlay.
          </div>
        </div>
      )}
    </>
  );
};

export default ARSConfig;
