import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { IssueReport, CategoryType, SeverityType, ReportStatusType } from '../types';
import {
  MapPin,
  Filter,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';

export const InteractiveMapView: React.FC = () => {
  const { reports, upvoteReport, verifyReport, addComment, comments } = useApp();
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatusType | 'All'>('All');
  
  // Selected Pin details
  const [activeReportId, setActiveReportId] = useState<string | null>('rep_001'); // open Chappan pothole by default
  const [newCommentText, setNewCommentText] = useState('');

  const activeReport = reports.find(r => r.reportId === activeReportId);

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    if (selectedCategory !== 'All' && report.category !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && report.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'All' && report.status !== selectedStatus) return false;
    return true;
  });

  // Indore presets layout for fast jump / landmarks
  const MAP_SPOTS = [
    { name: 'Rajwada Palace', lat: 22.7186, lng: 75.8557, id: 'rep_002' },
    { name: 'Chappan Dukan', lat: 22.7275, lng: 75.8788, id: 'rep_001' },
    { name: 'Palasia Square', lat: 22.7244, lng: 75.8839, id: 'rep_003' },
    { name: 'Bhawarkua Square', lat: 22.6996, lng: 75.8682, id: 'rep_004' },
    { name: 'Ranjit Hanuman', lat: 22.7052, lng: 75.8312, id: 'rep_005' }
  ];

  // Leaflet map references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportId || !newCommentText.trim()) return;
    addComment(activeReportId, newCommentText);
    setNewCommentText('');
  };

  const getMarkerColorClass = (severity: SeverityType, status: ReportStatusType) => {
    if (status === 'Resolved') return 'bg-emerald-500';
    if (severity === 'Critical') return 'bg-rose-500 animate-pulse';
    if (severity === 'High') return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const customDivIcon = (severity: SeverityType, status: ReportStatusType, isActive: boolean) => {
    const colorClass = getMarkerColorClass(severity, status);
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200/80 relative transition-transform duration-200 ${
            isActive ? 'scale-110 ring-4 ring-blue-500/15' : 'hover:scale-105'
          }">
            <div class="w-5.5 h-5.5 rounded-full flex items-center justify-center text-white ${colorClass}">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            ${isActive ? '<span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span></span>' : ''}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      tooltipAnchor: [0, -16]
    });
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered on Indore near Chappan Dukan / Palasia Square
    const map = L.map(mapContainerRef.current, {
      center: [22.7224, 75.8720],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add free, lightweight OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Force redraw on mount to fix gray background square container resizing glitch
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // 2. Synchronize markers on changes of filtered reports or active report
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredReports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      const isActive = report.reportId === activeReportId;
      const icon = customDivIcon(report.severity, report.status, isActive);

      const marker = L.marker([report.latitude, report.longitude], { icon });

      marker.on('click', () => {
        setActiveReportId(report.reportId);
      });

      marker.bindTooltip(`
        <div class="font-sans text-xs p-1">
          <div class="font-bold text-slate-800">${report.title}</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">${report.category} &middot; <span class="font-bold">${report.severity}</span></div>
        </div>
      `, {
        direction: 'top',
        opacity: 0.95
      });

      marker.addTo(markersLayer);

      // Smooth pan to active report
      if (isActive) {
        map.panTo([report.latitude, report.longitude], { animate: true });
      }
    });
  }, [filteredReports, activeReportId]);

  const handlePresetClick = (spot: { name: string; lat: number; lng: number; id: string }) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([spot.lat, spot.lng], 15, { animate: true });
    }
    setActiveReportId(spot.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-150 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Interactive Civic Map</h2>
          <p className="text-slate-500 text-sm mt-1">
            Realtime geopositioning of Indore infrastructure hazards. Filter issues and inspect live progress.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-150 px-4 py-2 rounded-2xl text-[10px] font-mono shadow-sm">
          <span className="text-slate-400 uppercase font-bold mr-1">LEGEND:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Medium/Low</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved</span>
        </div>
      </div>

      {/* Filters Board */}
      <div className="bg-white border border-slate-150 p-4 rounded-3xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1.5">Filter Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-150 text-slate-600 text-xs outline-none focus:bg-white focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Water Leakage">Water Leakages</option>
            <option value="Garbage">Garbage / Waste</option>
            <option value="Broken Streetlight">Streetlights</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Drainage">Drainage / Sewer</option>
            <option value="Traffic Signal">Traffic Signals</option>
            <option value="Illegal Dumping">Illegal Dumping</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Tree Fallen">Fallen Trees</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1.5">Filter Severity</label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-150 text-slate-600 text-xs outline-none focus:bg-white focus:border-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1.5">Filter Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-150 text-slate-600 text-xs outline-none focus:bg-white focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="AI Verified">AI Verified</option>
            <option value="Community Verified">Community Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Map canvas vs. Side Details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Grid: OpenStreetMap Leaflet Map (Col 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-150 p-6 rounded-[32px] relative flex flex-col min-h-[480px] shadow-sm">
          <div className="absolute top-4 left-4 z-30 bg-blue-50 border border-blue-100 text-[10px] font-mono text-blue-600 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Live Interactive Map (OpenStreetMap)</span>
          </div>

          {/* Map container */}
          <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-slate-150 mt-6 z-10">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Quick jump presets for Indore */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1">Quick Jump:</span>
            {MAP_SPOTS.map((spot) => (
              <button
                key={spot.name}
                onClick={() => handlePresetClick(spot)}
                className="text-[10px] font-mono font-semibold px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all"
              >
                {spot.name}
              </button>
            ))}
          </div>

          {/* Results summary counter */}
          <div className="mt-4 text-xs font-mono text-slate-400 font-semibold">
            Displaying <span className="text-slate-700 font-bold">{filteredReports.length}</span> reports matching current filters.
          </div>
        </div>

        {/* Right Grid: Detailed Inspector Panel (Col 5) */}
        <div className="lg:col-span-5 flex flex-col">
          {activeReport ? (
            <div className="bg-white border border-slate-150 p-6 rounded-[32px] flex flex-col justify-between h-full space-y-6 shadow-sm">
              
              {/* Report summary card details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-blue-600 block uppercase">
                      {activeReport.category} INSPECTION
                    </span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-0.5">{activeReport.title}</h3>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold font-mono border border-slate-150 bg-slate-50 text-slate-500 px-2 py-0.5 rounded">
                    {activeReport.reportId}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 text-xs text-slate-500 leading-relaxed">
                  {activeReport.description}
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50/30 border border-slate-150/60">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold mb-0.5">Severity</span>
                    <span className="font-bold font-mono text-slate-800">{activeReport.severity}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/30 border border-slate-150/60">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold mb-0.5">Status</span>
                    <span className="font-bold font-mono text-emerald-600">{activeReport.status}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/30 border border-slate-150/60">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold mb-0.5">Est. Repair Budget</span>
                    <span className="font-bold font-mono text-blue-600">₹{activeReport.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/30 border border-slate-150/60">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold mb-0.5">Time Predicted</span>
                    <span className="font-bold font-mono text-amber-600">{activeReport.predictedResolutionTime}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 text-xs space-y-1.5 text-slate-500">
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 w-24 font-bold">ADDRESS:</span>
                    <span className="text-slate-600">{activeReport.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 w-24 font-bold">WARD:</span>
                    <span className="text-slate-600">{activeReport.ward}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 w-24 font-bold">RECOM. DEPT:</span>
                    <span className="text-blue-600 font-bold">{activeReport.recommendedDepartment}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 w-24 font-bold">REPORTED BY:</span>
                    <span className="text-slate-600">{activeReport.authorName}</span>
                  </div>
                </div>
              </div>

              {/* Action tray: upvote, verify, comment listings */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => upvoteReport(activeReport.reportId)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-50"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote ({activeReport.upvotesCount})</span>
                  </button>

                  <button
                    onClick={() => verifyReport(activeReport.reportId)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verify ({activeReport.verificationsCount})</span>
                  </button>
                </div>

                {/* Mini Comments thread */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">
                    Discussion ({comments[activeReport.reportId]?.length || 0})
                  </span>

                  <div className="max-h-32 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
                    {(comments[activeReport.reportId] || []).map((comm) => (
                      <div key={comm.commentId} className="text-[11px] text-slate-500 pt-2.5 first:pt-0">
                        <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-0.5">
                          <span className="font-bold text-slate-700">{comm.authorName}</span>
                          <span>{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed text-slate-500">{comm.content}</p>
                      </div>
                    ))}
                    {(!comments[activeReport.reportId] || comments[activeReport.reportId].length === 0) && (
                      <div className="text-[11px] text-slate-400 italic py-1">
                        No community comments on this report yet.
                      </div>
                    )}
                  </div>

                  {/* Add Comment form */}
                  <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add to the citizen discussion..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-150 text-xs outline-none text-slate-850 placeholder:text-slate-300 focus:bg-white focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 border border-slate-200 transition-colors shrink-0"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-150 p-6 rounded-[32px] text-center flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 shadow-sm">
              <MapPin className="w-8 h-8 text-slate-300 mb-2.5" />
              <p className="text-sm font-bold text-slate-700">No report selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Click on any of the color-coded pins on the Indore map grid to inspect report metrics and join community conversations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
