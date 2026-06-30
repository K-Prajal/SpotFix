import React from 'react';
import { useApp } from '../context/AppContext';
import { BADGES_LIST } from '../seedData';
import {
  Award,
  Crown,
  FileText,
  ShieldAlert,
  Lightbulb,
  Trash2,
  HeartHandshake,
  TrendingUp,
  Info
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { currentUser, leaderboard } = useApp();

  // Helper: Safely map badge strings to Lucide vectors (with saturated light theme compatible colors)
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-6 h-6 text-indigo-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-rose-600" />;
      case 'Lightbulb':
        return <Lightbulb className="w-6 h-6 text-amber-600" />;
      case 'Trash2':
        return <Trash2 className="w-6 h-6 text-emerald-600" />;
      case 'Award':
        return <Award className="w-6 h-6 text-blue-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-pink-600" />;
      default:
        return <Award className="w-6 h-6 text-teal-600" />;
    }
  };

  // Rank progress helper
  const getRankMilestone = (rank: string) => {
    switch (rank) {
      case 'Bronze': return 1000;
      case 'Silver': return 2000;
      case 'Gold': return 3000;
      default: return 5000;
    }
  };

  const nextMilestone = getRankMilestone(currentUser?.rank || 'Bronze');
  const xpProgressPercent = Math.min(100, ((currentUser?.xp || 0) / nextMilestone) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Award className="w-7 h-7 text-blue-600" />
          <span>Indore Citizen League</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Compete with your neighbors, unlock merit badges, and earn rewards for reporting and verifying local hazards.
        </p>
      </div>

      {/* Gamification Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Left Column: Progress Board (Col 1) */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono text-blue-600 uppercase tracking-wider">My Citizen Progress</h3>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-150">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
                <Crown className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase leading-none font-bold">CURRENT TIER</span>
                <span className="block text-xl font-bold text-slate-800 mt-1">{currentUser?.rank} Tier</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>XP PROGRESS: {currentUser?.xp} XP</span>
                <span>NEXT: {nextMilestone} XP</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${xpProgressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 text-xs text-slate-500 leading-relaxed space-y-1.5 mt-4">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span>How to earn points:</span>
            </div>
            <p>● <strong className="text-slate-700">Submit Report</strong>: +150 XP, +15 Reputation</p>
            <p>● <strong className="text-slate-700">Community Verification</strong>: +30 XP, +8 Reputation</p>
            <p>● <strong className="text-slate-700">Write Comment</strong>: +20 XP, +5 Reputation</p>
          </div>
        </div>

        {/* Right Columns: Ranks & Badges Rack (Col 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl space-y-6 shadow-sm">
          <h3 className="text-sm font-bold font-mono text-blue-600 uppercase tracking-wider">Active Indore Leaderboard</h3>
          
          <div className="divide-y divide-slate-100">
            {leaderboard.map((user, idx) => {
              const isCurrentUser = user.userId === currentUser?.userId;
              
              return (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between py-3.5 px-4 rounded-2xl transition-colors ${
                    isCurrentUser ? 'bg-blue-50/70 border border-blue-150' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-6 text-sm font-mono font-bold text-center ${
                      idx === 0 ? 'text-yellow-600 font-extrabold' : idx === 1 ? 'text-slate-500' : idx === 2 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full border border-slate-100 object-cover"
                    />

                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {user.name} {isCurrentUser && <span className="text-[9px] text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded-full border border-blue-100 ml-1 font-bold">YOU</span>}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {user.reportsCount} Reports • {user.rank} Rank
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-800 font-mono">{user.xp} XP</span>
                    <span className="text-[9px] text-slate-400 font-mono">+{user.reputationScore} Rep</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Badges Rack Section */}
      <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[32px] space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold font-mono text-blue-600 uppercase tracking-wider">Citizen Badges Rack</h3>
          <p className="text-slate-500 text-xs mt-1">
            Perform neighborhood actions to earn badges. Earned badges are showcased in your profile card.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {BADGES_LIST.map((badge) => {
            const hasBadge = currentUser?.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  hasBadge
                    ? 'bg-white border-blue-100 shadow-sm'
                    : 'bg-slate-50/40 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                    hasBadge
                      ? 'bg-blue-50 border-blue-100 text-blue-600'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {renderBadgeIcon(badge.icon)}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800">{badge.title}</h4>
                      {hasBadge && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                    <span className="block text-[9px] font-mono text-blue-600 mt-1.5 font-bold">
                      {hasBadge ? 'EARNED' : `REWARD: +${badge.xpReward} XP`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
