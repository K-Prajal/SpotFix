import React from 'react';
import { useApp } from '../context/AppContext';
import { IssueReport } from '../types';
import {
  Sparkles,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Flame,
  Award
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { reports, currentUser, setActiveTab, upvoteReport, verifyReport } = useApp();

  // Stats Calculations
  const totalReportsCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  const pendingCount = totalReportsCount - resolvedCount;
  
  // Custom user stats (filter reports authored by current user)
  const userReports = reports.filter((r) => r.authorId === currentUser?.userId);
  const userReportsCount = userReports.length;
  const userResolvedCount = userReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

  // Active activity feed (excluding completed ones, or latest 3)
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Status Badge Helper
  const renderStatusBadge = (status: IssueReport['status']) => {
    const config: Record<string, string> = {
      Submitted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
      'AI Verified': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
      'Community Verified': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      Assigned: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      'In Progress': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
      Resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      Closed: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${config[status] || 'bg-slate-500/10 text-slate-300'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Severity Badge Helper
  const renderSeverityBadge = (severity: IssueReport['severity']) => {
    const config = {
      Low: 'text-slate-400',
      Medium: 'text-yellow-500',
      High: 'text-orange-500',
      Critical: 'text-rose-500 font-extrabold animate-pulse',
    };
    return <span className={`text-[10px] font-bold font-mono ${config[severity]}`}>{severity.toUpperCase()}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-850">
      {/* Welcome Card & Citizen Profile Summary */}
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center p-0.5">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=120'}
              alt={currentUser?.name}
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center sm:justify-start">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Namaste, {currentUser?.name || 'Citizen'}!</h2>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border border-blue-100 uppercase">
                {currentUser?.role === 'admin' ? 'Super Admin' : 'Active Citizen'}
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              Indore stands as India's cleanest city because of volunteers like you. Let's inspect, report, and maintain our streets today.
            </p>
          </div>
        </div>

        <div className="flex gap-4 shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 px-6 py-4 rounded-[22px] bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-orange-100 transform active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Report New Issue</span>
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">All Indore Reports</span>
          <span className="block text-3xl font-bold text-slate-800 mt-1">{totalReportsCount}</span>
          <span className="text-[10px] text-slate-500 block mt-2 font-mono">
            ● <span className="text-yellow-600 font-bold">{pendingCount} Active Issues</span>
          </span>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">My Contributions</span>
          <span className="block text-3xl font-bold text-slate-800 mt-1">{userReportsCount}</span>
          <span className="text-[10px] text-slate-500 block mt-2 font-mono">
            ● <span className="text-emerald-600 font-bold">{userResolvedCount} Resolved</span>
          </span>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">Reputation Score</span>
          <span className="block text-3xl font-bold text-slate-800 mt-1">+{currentUser?.reputationScore || 0}</span>
          <span className="text-[10px] text-slate-500 block mt-2 font-mono">
            ● <span className="text-blue-600 font-bold">XP Points: {currentUser?.xp || 0}</span>
          </span>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">Citizen Rank</span>
          <span className="block text-3xl font-bold text-slate-800 mt-1">{currentUser?.rank || 'Bronze'}</span>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, ((currentUser?.xp || 0) % 1000) / 10)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Recent / Right AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Community Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Latest Community Reports</span>
            </h3>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold font-mono"
            >
              VIEW CIVIC MAP →
            </button>
          </div>

          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.reportId}
                className="bg-white hover:bg-slate-50/50 border border-slate-100 p-5 rounded-3xl shadow-sm transition-all flex flex-col sm:flex-row justify-between gap-5 relative overflow-hidden group"
              >
                {/* Colored hazard accent line */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  report.severity === 'Critical' ? 'bg-rose-500' : report.severity === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>

                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderStatusBadge(report.status)}
                    <span className="text-[10px] text-slate-400 font-mono">SEVERITY:</span>
                    {renderSeverityBadge(report.severity)}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* Hyperlocal metadata */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="truncate max-w-[200px]">{report.address}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Vote, Verify & Comment action widgets */}
                <div className="flex sm:flex-col justify-end items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5 shrink-0">
                  <button
                    onClick={() => upvoteReport(report.reportId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 text-xs font-semibold border border-slate-150 transition-all w-full justify-center"
                    title="Upvote report"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{report.upvotesCount} Upvotes</span>
                  </button>

                  <button
                    onClick={() => verifyReport(report.reportId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-600 text-slate-500 text-xs font-semibold border border-slate-150 transition-all w-full justify-center"
                    title="Verify this issue exists"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{report.verificationsCount} Verifies</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions / Hotspots Sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>AI Ward Insights</span>
          </h3>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white relative">
              <div className="flex items-center gap-2.5 mb-2">
                <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                <div>
                  <h4 className="text-[10px] font-mono text-blue-200 uppercase tracking-widest leading-none">HOTSPOT PREDICTION</h4>
                  <span className="text-sm font-bold text-white block mt-1">Palasia & Vijay Nagar Squares</span>
                </div>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Real-time mapping & predictive municipal routing powered by Google Gemini.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Based on historical trends of garbage collection delay reports and weather patterns, the system predicts a temporary risk of water logging near Bhawarkua Ward 12 over the next 48 hours.
              </p>

              {/* Department suggestions lists */}
              <div className="space-y-3">
                <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">SUGGESTED CITIZEN DRILLS:</span>
                
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex gap-2.5">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 font-bold rounded-lg flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-slate-800">Verify Streetlight Outages</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">3 reports near Rajwada market need community verifying to dispatch maintenance truck.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex gap-2.5">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 font-bold rounded-lg flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-slate-800">Avoid Bhawarkua waterlogging</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">Sewer backup assigned to IMC Water Works has a predicted 48-hour resolution time.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full mt-2 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs text-blue-600 font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ask Civic AI Friend</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
