
import React from 'react';
import { User, Package, ScrollText, Map as MapIcon } from 'lucide-react';

interface Props {
  currentView: 'map' | 'character' | 'inventory' | 'quests';
  onChangeView: (view: 'map' | 'character' | 'inventory' | 'quests') => void;
}

const BottomNav: React.FC<Props> = ({ currentView, onChangeView }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: 'map' | 'character' | 'inventory' | 'quests', icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`flex flex-col items-center justify-center w-full py-2 transition-colors
          ${isActive ? 'text-amber-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}
        `}
      >
        <Icon size={24} className={isActive ? "fill-current opacity-20" : ""} strokeWidth={isActive ? 2.5 : 2} />
        <span className={`text-xs mt-1 font-serif ${isActive ? 'font-bold' : ''}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex justify-around items-center bg-slate-950 border-t border-slate-800 h-[60px] pb-safe">
      <NavItem view="map" icon={MapIcon} label="江湖" />
      <NavItem view="character" icon={User} label="人物" />
      <NavItem view="inventory" icon={Package} label="背包" />
      <NavItem view="quests" icon={ScrollText} label="任务" />
    </div>
  );
};

export default BottomNav;
