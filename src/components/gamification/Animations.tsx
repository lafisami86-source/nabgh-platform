'use client';
import { useEffect, useState } from 'react';
import { useUIStore } from "@/stores/index";

export function XPPopups() {
  const { xpPopups } = useUIStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {xpPopups.map(popup => (
        <div
          key={popup.id}
          className="absolute xp-float"
          style={{ left: `${popup.x}%`, top: `${popup.y}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-amber-400 text-white font-black text-lg rounded-full px-4 py-2 shadow-lg whitespace-nowrap">
            +{popup.amount} XP 🌟
          </div>
        </div>
      ))}
    </div>
  );
}

// Level up modal
export function LevelUpModal({ level, levelName, onClose }: { level: number; levelName: string; onClose: () => void }) {
  const levelIcons = ['🌱','🌿','🌳','⭐','🌟','👑','💎','🏆'];

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-gradient-to-br from-primary-500 to-secondary rounded-2xl p-8 text-white text-center shadow-2xl badge-unlock pointer-events-auto max-w-sm w-full">
        <div className="text-6xl mb-3">{levelIcons[level - 1] || '🏆'}</div>
        <p className="text-primary-100 text-sm">ارتقيت للمستوى الجديد!</p>
        <h2 className="text-3xl font-black font-cairo mt-1">المستوى {level}</h2>
        <p className="text-xl font-bold mt-1">{levelName}</p>
        <p className="text-primary-100 text-sm mt-3">استمر في التعلم للوصول للمستوى القادم 🚀</p>
        <button onClick={onClose} className="mt-4 bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-2 text-sm font-semibold transition">
          رائع! 🎉
        </button>
      </div>
    </div>
  );
}

// Badge unlock animation
export function BadgeUnlockModal({ badge, onClose }: { badge: { name: string; icon: string; description: string; rarity: string; xpBonus: number } | null; onClose: () => void }) {
  useEffect(() => {
    if (!badge) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [badge, onClose]);

  if (!badge) return null;

  const rarityColors: Record<string, string> = {
    common: 'from-slate-400 to-slate-500',
    uncommon: 'from-blue-400 to-blue-500',
    rare: 'from-purple-400 to-purple-500',
    epic: 'from-amber-400 to-orange-500',
    legendary: 'from-yellow-400 to-amber-500',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-gradient-to-br ${rarityColors[badge.rarity] || rarityColors.common} rounded-2xl p-8 text-white text-center shadow-2xl badge-unlock max-w-sm w-full`}>
        <div className="text-7xl mb-4">{badge.icon}</div>
        <p className="text-white/80 text-sm">🎉 شارة جديدة مفتوحة!</p>
        <h2 className="text-2xl font-black font-cairo mt-1">{badge.name}</h2>
        <p className="text-white/80 text-sm mt-2">{badge.description}</p>
        {badge.xpBonus > 0 && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-block">
            <span className="font-bold">+{badge.xpBonus} XP مكافأة!</span>
          </div>
        )}
        <button onClick={onClose} className="mt-4 block w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 text-sm font-semibold transition">
          رائع! 🎊
        </button>
      </div>
    </div>
  );
}
