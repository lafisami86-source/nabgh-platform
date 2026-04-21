'use client';
// Client-side XP popup and badge unlock animations
import { useEffect, useState } from 'react';

export default function DashboardClient({ newBadges, leveledUp, newLevel }: any) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  useEffect(() => { if (leveledUp) { setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 4000); } }, [leveledUp]);
  if (!showLevelUp) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-br from-primary-500 to-secondary text-white rounded-2xl p-8 text-center shadow-2xl badge-unlock">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-2xl font-black font-cairo">ارتقيت للمستوى {newLevel}!</h2>
        <p className="text-primary-100 mt-2">استمر في التعلم!</p>
      </div>
    </div>
  );
}
