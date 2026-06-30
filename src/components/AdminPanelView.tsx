import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IssueReport, ReportStatusType } from '../types';
import {
  ShieldAlert,
  Loader2,
  CheckCircle,
  Clock,
  Briefcase,
  AlertTriangle,
  Building,
  User,
  Trash2,
  TrendingUp,
  MapPin,
  FileCheck
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { reports, updateReportStatus } = useApp();
  const [selectedReportId, setSelectedReportId] = useState<string | null>('rep_002'); // Open Rajwada streetlight by default
  const [updating, setUpdating] = useState<string | null>(null);

  const activeAdminReport = reports.find(r => r.reportId === selectedReportId);

  // Stats
  const activeUnassigned = reports.filter(r => r.status === 'Submitted' || r.status === 'AI Verified').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
  const totalResolved = reports.filter(r => r.status === 'Resolved').length;

  const handleStatusChange = async (reportId: string, nextStatus: ReportStatusType) => {
    setUpdating(nextStatus);
    try {
      await updateReportStatus(reportId, nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const renderStatusButton = (report: IssueReport, targetStatus: ReportStatusType, label: string, colorClass: string) => {
    const isCurrent = report.status === targetStatus;
    return (
      <button
        disabled={isCurrent || updating !== null}
        onClick={() => handleStatusChange(report.reportId, targetStatus)}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          isCurrent
            ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
            : `${colorClass} text-white shadow-md shadow-blue-50`
        }`}
      >
        {updating === targetStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-rose-500" />
          <span>Indore Municipal Council Control</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Supervisor panel for IMC division managers. Oversee civic reports, audit Gemini cost budgets, and coordinate repairs.
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">INCOMING QUEUE</span>
          <span className="block text-3xl font-bold text-yellow-600 mt-1">{activeUnassigned} Pending</span>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">ACTIVE DISPATCHES</span>
          <span className="block text-3xl font-bold text-orange-600 mt-1">{inProgressCount} Dispatched</span>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-1">
          <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">RESOLVED PROJECTS</span>
          <span className="block text-3xl font-bold text-emerald-600 mt-1">{totalResolved} Completed</span>
        </div>
      </div>

      {/* Main Grid: Pending Queue List vs Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: List (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-5 rounded-[32px] space-y-4 shadow-sm">
          <h3 className="text-sm font-bold font-mono text-blue-600 uppercase tracking-wider mb-2">Live Dispatch Queue</h3>
          
          <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
            {reports.map((rep) => {
              const isSelected = rep.reportId === selectedReportId;
              
              return (
                <div
                  key={rep.reportId}
                  onClick={() => setSelectedReportId(rep.reportId)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all text-left ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                      : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase truncate max-w-[150px]">
                      {rep.category}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      rep.status === 'Resolved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">{rep.title}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{rep.address}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Supervisor Inspector Card (Col 7) */}
        <div className="lg:col-span-7">
          {activeAdminReport ? (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[32px] flex flex-col justify-between h-full space-y-6 shadow-sm">
              
              <div className="space-y-5">
                <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                      INSPECTOR COMMANDS
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{activeAdminReport.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 bg-slate-50 px-2.5 py-0.5 rounded">
                    {activeAdminReport.reportId}
                  </span>
                </div>

                {/* AI Estimates Panel for Supervisors */}
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600">
                    <FileCheck className="w-4.5 h-4.5" />
                    <span>AUDITING GEMINI AI PREDICTIONS:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-500">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold">RECOMMENDED DEPT:</span>
                      <span className="font-bold text-slate-700">{activeAdminReport.recommendedDepartment}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold">URGENCY METRIC:</span>
                      <span className="font-bold text-slate-700">{activeAdminReport.urgency}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold">EST. REPAIR COST:</span>
                      <span className="font-bold text-emerald-600">₹{activeAdminReport.estimatedCost.toLocaleString()} INR</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold">EXPECTED RESOLUTION:</span>
                      <span className="font-bold text-amber-600">{activeAdminReport.predictedResolutionTime}</span>
                    </div>
                  </div>
                </div>

                {/* Incident details content */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">CITIZEN DESCRIPTION:</span>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {activeAdminReport.description}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 font-mono">
                    <p>● <strong className="text-slate-600">Author</strong>: {activeAdminReport.authorName}</p>
                    <p>● <strong className="text-slate-600">Ward</strong>: {activeAdminReport.ward}</p>
                    <p>● <strong className="text-slate-600">Landmark</strong>: {activeAdminReport.landmark || 'None specified'}</p>
                    <p>● <strong className="text-slate-600">Contact</strong>: {activeAdminReport.contactNumber || 'None provided'}</p>
                  </div>
                </div>
              </div>

              {/* Status dispatch action buttons */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">
                  DISPATCH CONTROL STATUS TRANSLATIONS:
                </span>

                <div className="flex flex-wrap gap-3">
                  {renderStatusButton(activeAdminReport, 'Assigned', 'Assign crew', 'bg-blue-600 hover:bg-blue-700')}
                  {renderStatusButton(activeAdminReport, 'In Progress', 'Start repaving/fixing', 'bg-orange-600 hover:bg-orange-700')}
                  {renderStatusButton(activeAdminReport, 'Resolved', 'Complete & Close', 'bg-emerald-600 hover:bg-emerald-700')}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
              <ShieldAlert className="w-8 h-8 text-slate-300 mb-2.5" />
              <p className="text-sm font-bold text-slate-600">No dispatch selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Select an active municipal complaint from the left-hand live dispatch queue to assign department personnel, audit budgets, or record complete fixes.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
