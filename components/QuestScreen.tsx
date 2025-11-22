
import React from 'react';
import { ScrollText, CheckCircle, Circle } from 'lucide-react';

const QuestScreen: React.FC = () => {
  // Mock Data
  const quests = [
    { id: 1, title: "初入江湖", desc: "在无名荒村四处看看，熟悉环境。", status: "active", progress: "0/1" },
    { id: 2, title: "拜师学艺", desc: "前往残剑门，寻找当年的真相。", status: "locked", progress: "未开启" },
  ];

  return (
    <div className="flex-1 bg-slate-900 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold text-amber-500 font-serif mb-6 text-center border-b border-slate-800 pb-4">
        江湖传书
      </h2>

      <div className="space-y-4">
        {quests.map(quest => (
            <div key={quest.id} className={`p-4 rounded border relative overflow-hidden ${quest.status === 'active' ? 'bg-slate-800 border-amber-800/50' : 'bg-slate-900 border-slate-800 grayscale opacity-60'}`}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-amber-100 text-lg font-serif">{quest.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${quest.status === 'active' ? 'bg-amber-900 text-amber-200' : 'bg-slate-700 text-slate-400'}`}>
                        {quest.status === 'active' ? '进行中' : '未开启'}
                    </span>
                </div>
                <p className="text-slate-400 text-sm mb-3 leading-relaxed">{quest.desc}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-700/50 pt-2">
                    <ScrollText size={12} />
                    <span>进度: {quest.progress}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default QuestScreen;
