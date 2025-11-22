import React, { useEffect, useRef } from 'react';
import { GameLogEntry } from '../types';

interface Props {
  logs: GameLogEntry[];
}

const GameLog: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    // Added min-h-[60px] to prevent collapse
    <div className="h-full w-full bg-slate-900 overflow-y-auto p-3 scrollbar-hide min-h-[60px]">
      <div className="space-y-2 pb-2">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`text-sm leading-tight font-serif ${
              log.type === 'user' ? 'text-slate-400 hidden' : 
              log.type === 'combat' ? 'text-red-400' :
              log.type === 'narrative' ? 'text-amber-200/90' :
              'text-slate-300'
            }`}
          >
            {log.type === 'system' && <span className="text-slate-500 mr-1">▸</span>}
            {log.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default GameLog;