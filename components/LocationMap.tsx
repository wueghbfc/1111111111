
import React, { useState } from 'react';
import { MapPin, Map as MapIcon, X } from 'lucide-react';
import { getLocationInfo, getAllLocations } from '../services/gameEngine';

interface Props {
  currentLocationId: string;
  onMove: (destinationId: string) => void;
  disabled: boolean;
}

const LocationMap: React.FC<Props> = ({ currentLocationId, onMove, disabled }) => {
  const [showMinimap, setShowMinimap] = useState(false);
  const currentLoc = getLocationInfo(currentLocationId);

  // --- Helper for Main Navigation Grid ---
  const renderCell = (targetId: string | undefined, directionLabel?: string) => {
    if (!targetId) {
      return <div className="w-full h-full bg-slate-900/30 rounded border border-slate-800/50" />;
    }

    const targetInfo = getLocationInfo(targetId);

    return (
      <button
        onClick={() => onMove(targetId)}
        disabled={disabled}
        className="w-full h-full bg-slate-800 border-2 border-slate-600 hover:border-amber-500 hover:bg-slate-700 active:bg-slate-600 transition-all rounded flex flex-col items-center justify-center p-1 shadow-lg group relative"
      >
        <span className="text-[10px] text-slate-500 absolute top-0.5">{directionLabel}</span>
        <span className="text-sm font-bold text-slate-200 group-hover:text-amber-400 font-serif text-center leading-tight px-0.5 line-clamp-2">
          {targetInfo.name}
        </span>
      </button>
    );
  };

  // --- Helper for Minimap Rendering ---
  const renderMinimap = () => {
    const allLocs = getAllLocations();
    
    // 1. Find bounds
    const xs = allLocs.map(l => l.x);
    const ys = allLocs.map(l => l.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;
    
    // 2. Dynamic Sizing Calculation
    // Use viewport units since we are in fixed mode
    const safeWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 300; 
    const safeHeight = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 400;
    
    const GAP = 2; 
    
    const sizeByWidth = (safeWidth - (cols - 1) * GAP) / cols;
    const sizeByHeight = (safeHeight - (rows - 1) * GAP) / rows;
    
    // Reduced max size to 32 and min size to 16 to fit more cells
    const CELL_SIZE = Math.floor(Math.min(32, Math.max(16, Math.min(sizeByWidth, sizeByHeight))));

    const totalMapWidth = cols * CELL_SIZE + (cols - 1) * GAP;
    const totalMapHeight = rows * CELL_SIZE + (rows - 1) * GAP;

    return (
      <div 
        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 p-4"
        onClick={() => setShowMinimap(false)}
      >
        <div 
          className="flex flex-col items-center justify-center w-full max-w-sm"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="w-full flex justify-between items-center mb-3 border-b border-amber-700/50 pb-2 px-2">
              <h3 className="text-amber-500 font-bold font-serif text-lg">江湖舆图</h3>
              <button 
                onClick={() => setShowMinimap(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                  <X size={24} />
              </button>
          </div>

          <div className="relative bg-[#dcb178] rounded shadow-2xl border-4 border-amber-900 flex items-center justify-center p-4 overflow-auto max-h-[70vh] max-w-full">
            <div 
              className="relative shrink-0"
              style={{
                  width: `${totalMapWidth}px`,
                  height: `${totalMapHeight}px`
              }}
            >
              {allLocs.map(loc => {
                  const left = (loc.x - minX) * (CELL_SIZE + GAP);
                  const bottom = (loc.y - minY) * (CELL_SIZE + GAP);
                  
                  const isCurrent = loc.id === currentLocationId;
                  // Adjusted font size calculation for smaller cells
                  const fontSize = Math.max(8, CELL_SIZE / 3.5);

                  return (
                      <div
                          key={loc.id}
                          className={`absolute flex flex-col items-center justify-center text-center shadow-sm border transition-all
                              ${isCurrent 
                                  ? 'bg-red-800 text-white border-amber-400 z-10 ring-1 ring-amber-300' 
                                  : 'bg-amber-100/90 text-amber-900 border-amber-800/30'
                              }
                          `}
                          style={{
                              left: `${left}px`,
                              bottom: `${bottom}px`,
                              width: `${CELL_SIZE}px`,
                              height: `${CELL_SIZE}px`,
                              borderRadius: '2px',
                          }}
                      >
                          <span 
                            className="font-bold leading-none px-0.5 break-words w-full"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                              {loc.name}
                          </span>
                          {isCurrent && <div className="w-1 h-1 bg-amber-400 rounded-full mt-0.5 animate-pulse" />}
                      </div>
                  );
              })}
            </div>
          </div>
          <p className="mt-3 text-slate-500 text-xs font-serif">当前位置：{currentLoc.name}</p>
          <p className="mt-1 text-slate-600 text-[10px] opacity-70">(点击空白处关闭)</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-slate-900 relative flex items-center justify-center p-2">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/chinese-style.png')] bg-repeat" />
      
      {/* Main Navigation Grid - Scaled to fit parent container exactly */}
      <div className="relative w-full h-full max-w-md max-h-full aspect-square grid grid-cols-3 grid-rows-3 gap-2 z-10">
        {/* Row 1 */}
        <div className="opacity-0 pointer-events-none"></div>
        <div className="flex justify-center">{renderCell(currentLoc.north, '北')}</div>
        <div className="opacity-0 pointer-events-none"></div>

        {/* Row 2 */}
        <div className="flex items-center">{renderCell(currentLoc.west, '西')}</div>
        
        {/* CENTER: Current Location */}
        <div className="relative bg-amber-900/20 border-2 border-amber-600 rounded shadow-[0_0_20px_rgba(217,119,6,0.3)] flex flex-col items-center justify-center p-1 overflow-hidden">
           <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wider shadow-sm whitespace-nowrap z-20">
             当前位置
           </div>
           <MapPin size={24} className="text-amber-500 mb-1 animate-bounce z-10 mt-3" />
           <span className="text-lg font-bold text-amber-100 font-serif text-center leading-tight z-10">{currentLoc.name}</span>
        </div>

        <div className="flex items-center">{renderCell(currentLoc.east, '东')}</div>

        {/* Row 3 */}
        <div className="opacity-0 pointer-events-none"></div>
        <div className="flex justify-center">{renderCell(currentLoc.south, '南')}</div>
        <div className="opacity-0 pointer-events-none"></div>
      </div>

      {/* Minimap Toggle Button */}
      <button 
        onClick={() => setShowMinimap(true)}
        className="absolute bottom-2 right-2 z-20 bg-slate-800 text-amber-500 p-2 rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 hover:text-amber-400 transition-all active:scale-95"
      >
        <MapIcon size={20} />
      </button>

      {/* Full Map Overlay */}
      {showMinimap && renderMinimap()}
    </div>
  );
};

export default LocationMap;
