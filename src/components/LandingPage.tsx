import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Sparkles,
  Camera,
  Activity,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, currentUser } = useApp();

  const handleCTA = () => {
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      // Switch tab to a custom tab or just log them in
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-850 min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden py-24 lg:py-32 border-b border-slate-150">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50/50 to-slate-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6 text-xs text-blue-600 font-bold shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow text-blue-500" />
            <span>AI-POWERED HYPERLOCAL REPORTS FOR INDORE</span>
          </div>

          <h1 className="font-sans font-bold text-4xl sm:text-5xl lg:text-7xl tracking-tight text-slate-900 max-w-5xl mx-auto leading-tight mb-6 animate-fade-in">
            Make Indore Cleaner, Safer, and Smarter with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
              SpotFix
            </span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap a picture of potholes, faulty streetlights, or waste issues. Let Gemini AI classify, route, and update you in real time as authorities resolve it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCTA}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all font-bold shadow-lg shadow-blue-100 text-white transform hover:scale-[1.02]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-800 font-bold shadow-sm"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20 pt-10 border-t border-slate-200">
            <div className="text-center">
              <span className="block text-3xl font-bold text-teal-600">94%</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">RESOLUTION RATE</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-blue-600">36 Hrs</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">AVG. FIX TIME</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-emerald-600">12,450+</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">ACTIVE CITIZENS</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-amber-600">54 Wards</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">COV. IN INDORE</span>
            </div>
          </div>
        </div>
      </section>

      {/* How SpotFix Works Section */}
      <section id="how-it-works" className="py-24 border-b border-slate-150 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase font-mono mb-2">CIVIC PIPELINE</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">How SpotFix Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-5">
                <Camera className="w-6 h-6" />
              </div>
              <span className="absolute top-6 right-6 text-4xl font-black text-slate-100 select-none">01</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Snap & Upload</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Take a quick photo of any issue (pothole, streetlight, garbage) anywhere in Indore.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="absolute top-6 right-6 text-4xl font-black text-slate-100 select-none">02</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Gemini AI Analysis</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                AI immediately identifies the problem, estimates severity, budgets repair cost, and routes to correct municipal department.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5">
                <Users className="w-6 h-6" />
              </div>
              <span className="absolute top-6 right-6 text-4xl font-black text-slate-100 select-none">03</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Community Votes</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Nearby citizens upvote and verify the issue. High-vote reports get fast-tracked inside the IMC supervisor pipeline.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="absolute top-6 right-6 text-4xl font-black text-slate-100 select-none">04</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Issue Resolved</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Department crews fix the problem and upload verification photos. You earn XP rewards and badges for your contribution!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text description */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>POWERED BY GOOGLE GEMINI AI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 tracking-tight">
                AI Diagnostics & Agentic Routing
              </h2>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                SpotFix embeds deep multi-modal intelligence directly into the civic pipeline. When you submit a photo, our backend triggers real-time analysis to empower both citizens and Indore Municipal officers:
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-100">✓</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Instant Duplicity Screening</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Scans previous reports in the same coordinates to block spam and merge duplicate reports automatically.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-100">✓</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Intelligent Cost & Time Budgets</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Gemini predicts the average materials cost and expected repair duration, aiding council prioritization.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-100">✓</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Agentic Chat Assistant</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Chat in real-time with our assistant to check your reports, query department details, or fetch a live map summary.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive representation box */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-[32px] relative shadow-lg shadow-slate-150">
              <div className="absolute -top-3.5 -right-3.5 bg-amber-500 text-white text-[10px] font-bold font-mono px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>LIVE AI SCAN</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=300"
                    alt="Pothole demo"
                    className="object-cover w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Chappan_Pothole_Scan_09.png</h3>
                  <p className="text-xs text-slate-400">Latitude: 22.7275, Longitude: 75.8788</p>
                </div>
              </div>

              {/* Analyzed stats display */}
              <div className="space-y-3.5 font-mono text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-slate-150 shadow-sm">
                  <span className="text-slate-400 font-bold">CATEGORY:</span>
                  <span className="text-teal-600 font-bold">Pothole</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-slate-150 shadow-sm">
                  <span className="text-slate-400 font-bold">SEVERITY:</span>
                  <span className="text-rose-600 font-bold">High</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-slate-150 shadow-sm">
                  <span className="text-slate-400 font-bold">ROUTED DEPT:</span>
                  <span className="text-blue-600 font-bold">IMC Public Works Division</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-slate-150 shadow-sm">
                  <span className="text-slate-400 font-bold">EST. BUDGET:</span>
                  <span className="text-emerald-600 font-bold">₹3,500 INR</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-slate-150 shadow-sm">
                  <span className="text-slate-400 font-bold">RESOLUTION TIME:</span>
                  <span className="text-amber-600 font-bold">48 Hours</span>
                </div>
              </div>

              <div className="mt-5 p-3.5 rounded-2xl bg-white text-xs text-slate-500 italic border border-slate-150 leading-relaxed shadow-sm">
                "Underground pipeline micro-fissure detected causing road sub-layer erosion. Immediate repaving required."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50/50 border-b border-slate-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase font-mono mb-2">COMMUNITY TRUST</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Loved by Indore Citizens</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <p className="text-slate-500 text-sm italic mb-6 leading-relaxed">
                "Our ward at Vijay Nagar had three broken streetlights that weren't repaired for months. I reported them via SpotFix. Gemini AI classified the lights automatically, routed them to MPPKVVCL, and they were fixed in 36 hours! Amazing tech."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                  VS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Vikas Singh</h4>
                  <span className="text-xs text-slate-400 font-bold">Resident, Vijay Nagar</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <p className="text-slate-500 text-sm italic mb-6 leading-relaxed">
                "Being India's cleanest city, Indore takes waste seriously. SpotFix helps us keep it that way. I uploaded a picture of illegal dumping on my way to work, and garbage trucks cleared it before I returned home in the evening. The gamification XP points keep me motivated!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                  NK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Neha Khandelwal</h4>
                  <span className="text-xs text-slate-400 font-bold">Eco-activist, Palasia</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <p className="text-slate-500 text-sm italic mb-6 leading-relaxed">
                "The interactive heatmaps on SpotFix let us coordinate and see where hazards are concentrated. When I verify an issue reported by someone else, I literally feel like I'm contributing to municipal health. Incredible application layout."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                  RP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Rajeev Patwardhan</h4>
                  <span className="text-xs text-slate-400 font-bold">Volunteer, Bhawarkua Ward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white border-b border-slate-150 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">Join Indore's Smart Citizen Initiative</h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Take part in shaping Indore's infrastructure. Claim your reputation badges, compete on the weekly leaderboard, and earn citizen rank certificates today.
          </p>
          <button
            onClick={handleCTA}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-bold transition-all transform hover:scale-105 shadow-xl shadow-blue-100"
          >
            Launch Citizen Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/60 py-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600 font-sans font-bold">SpotFix Indore</span>
          </div>
          <p>© 2026 SpotFix Platform. Developed for Vibe2Ship Hackathon on Google Cloud Run.</p>
        </div>
      </footer>
    </div>
  );
};
