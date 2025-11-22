
import React from 'react';
import { Eye, Coffee, Search } from 'lucide-react';

interface Props {
  onAction: (action: string) => void;
  disabled: boolean;
}

const ControlPanel: React.FC<Props> = ({ onAction, disabled }) => {
  const ActionBtn = ({ icon: Icon, label, action }: any) => (
    <button
      disabled={disabled}
      onClick={() => onAction(action)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded hover:bg-slate-700 hover:text-amber-200 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
    >
      <Icon size={14} />
      <span className="text-xs font-bold font-serif">{label}</span>
    </button>
  );

  return (
    <div className="w-full py-2 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
      <div className="flex justify-center gap-4 max-w-md mx-auto">
           <ActionBtn icon={Eye} label="观察" action="观察四周" />
           <ActionBtn icon={Search} label="搜寻" action="搜寻物品" />
           <ActionBtn icon={Coffee} label="打坐" action="打坐调息" />
      </div>
    </div>
  );
};

export default ControlPanel;
