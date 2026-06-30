import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryType, SeverityType, IssueReport } from '../types';
import {
  Sparkles,
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  HelpCircle,
  AlertCircle,
  Smartphone,
  UserCheck,
  Award
} from 'lucide-react';

// Preset mock hazard images (Unsplash links) converted to base64 or sent as visual anchors
const HAZARD_PRESETS = [
  {
    id: 'pothole',
    label: 'Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
    categoryHint: 'Pothole',
    descriptionHint: 'Huge crater right in the middle of Vijay Nagar main road. Cars are breaking hard to avoid it.'
  },
  {
    id: 'streetlight',
    label: 'Faulty Streetlight',
    url: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=600',
    categoryHint: 'Broken Streetlight',
    descriptionHint: 'Multiple streetlights in Palasia block are completely off. Deep pitch black after dark.'
  },
  {
    id: 'garbage',
    label: 'Garbage Dump',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
    categoryHint: 'Garbage',
    descriptionHint: 'A massive pile of commercial waste dumped on the pavement near Rajwada market. Bad smell and flies.'
  },
  {
    id: 'waterleak',
    label: 'Water Leakage',
    url: 'https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600',
    categoryHint: 'Water Leakage',
    descriptionHint: 'Main supply pipeline burst near Bhawarkua square. Drinking water is flooding down the road.'
  }
];

export const ReportIssueView: React.FC = () => {
  const { addReport, reports, triggerAIAnalysis } = useApp();
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [presetTriggering, setPresetTriggering] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('Other');
  const [severity, setSeverity] = useState<SeverityType>('Medium');
  const [urgency, setUrgency] = useState('Within 3 Days');
  const [estimatedCost, setEstimatedCost] = useState<number>(3000);
  const [predictedResolutionTime, setPredictedResolutionTime] = useState('5 Days');
  const [recommendedDepartment, setRecommendedDepartment] = useState('IMC Public Works Department');
  
  // Geolocation & Hyperlocal details
  const [ward, setWard] = useState('Ward 54 (Vijay Nagar)');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('Vijay Nagar, Indore, MP');
  const [lat, setLat] = useState(22.7533);
  const [lng, setLng] = useState(75.8937);
  const [contactNumber, setContactNumber] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // UI Flow States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateAlert, setDuplicateAlert] = useState<{ isDuplicate: boolean; id?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Convert url to base64
  const convertUrlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // strip the mime-type header if needed, but Express analyze expects raw base64 data
        const rawBase64 = base64data.split(',')[1];
        resolve(rawBase64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Preset trigger handler
  const handlePresetSelect = async (preset: typeof HAZARD_PRESETS[0]) => {
    setPresetTriggering(preset.id);
    setErrorMessage(null);
    setDuplicateAlert(null);
    setAnalysisCompleted(false);
    
    // Set mock address depending on preset to feel extremely local
    if (preset.id === 'pothole') {
      setWard('Ward 54 (Vijay Nagar - New Palasia)');
      setAddress('Near Chappan Dukan Entrance, New Palasia, Indore');
      setLat(22.7275);
      setLng(75.8788);
    } else if (preset.id === 'streetlight') {
      setWard('Ward 32 (Palasia)');
      setAddress('Palasia Road Stretch, Indore');
      setLat(22.7244);
      setLng(75.8839);
    } else if (preset.id === 'garbage') {
      setWard('Ward 45 (Rajwada)');
      setAddress('Rajwada Main Market, Indore');
      setLat(22.7186);
      setLng(75.8557);
    } else if (preset.id === 'waterleak') {
      setWard('Ward 12 (Bhawarkua)');
      setAddress('Bhawarkua Square, Indore');
      setLat(22.6996);
      setLng(75.8682);
    }

    try {
      setSelectedImage(preset.url);
      setAnalyzing(true);

      // Convert preset image to base64 for Gemini
      const base64 = await convertUrlToBase64(preset.url);

      // Trigger server analysis
      const analysisResult = await triggerAIAnalysis({
        imageBase64: base64,
        mimeType: 'image/jpeg',
        nearbyIssues: reports,
        categoryHint: preset.categoryHint,
        descriptionHint: preset.descriptionHint
      });

      if (!analysisResult.isImageClear) {
        throw new Error(analysisResult.feedbackMessage || 'AI could not detect any street hazard in this image.');
      }

      // Populate form with AI analysis
      setTitle(analysisResult.title);
      setDescription(analysisResult.description);
      setCategory(analysisResult.category);
      setSeverity(analysisResult.severity);
      setUrgency(analysisResult.urgency);
      setEstimatedCost(analysisResult.estimatedCost);
      setPredictedResolutionTime(analysisResult.predictedResolutionTime);
      setRecommendedDepartment(analysisResult.recommendedDepartment);
      setDuplicateAlert({ isDuplicate: analysisResult.isDuplicateNearby, id: analysisResult.duplicateReportId });

      setAnalysisCompleted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to analyzepreset image. Please check API key in Settings.');
    } finally {
      setAnalyzing(false);
      setPresetTriggering(null);
    }
  };

  // Image File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setDuplicateAlert(null);
    setAnalysisCompleted(false);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setAnalyzing(true);

      try {
        const rawBase64 = base64String.split(',')[1];
        const analysisResult = await triggerAIAnalysis({
          imageBase64: rawBase64,
          mimeType: file.type,
          nearbyIssues: reports,
          categoryHint: category,
          descriptionHint: description
        });

        if (!analysisResult.isImageClear) {
          throw new Error(analysisResult.feedbackMessage || 'The uploaded image is blurry, blank, or does not contain a municipal hazard. Please upload a clear picture of potholes, streetlights, or trash heaps.');
        }

        // Populate fields
        setTitle(analysisResult.title);
        setDescription(analysisResult.description);
        setCategory(analysisResult.category);
        setSeverity(analysisResult.severity);
        setUrgency(analysisResult.urgency);
        setEstimatedCost(analysisResult.estimatedCost);
        setPredictedResolutionTime(analysisResult.predictedResolutionTime);
        setRecommendedDepartment(analysisResult.recommendedDepartment);
        setDuplicateAlert({ isDuplicate: analysisResult.isDuplicateNearby, id: analysisResult.duplicateReportId });

        setAnalysisCompleted(true);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'AI analysis failed. You can still fill in the details manually.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await addReport({
        title,
        description,
        category,
        severity,
        urgency,
        estimatedCost,
        predictedResolutionTime,
        recommendedDepartment,
        ward,
        landmark,
        address,
        latitude: lat,
        longitude: lng,
        images: selectedImage ? [selectedImage] : [],
        anonymous,
        contactNumber,
      });

      setSubmitSuccess(true);
      
      // Reset form states
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedImage(null);
        setTitle('');
        setDescription('');
        setAnalysisCompleted(false);
      }, 3500);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to record report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>Citizen Report Dispatch</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Take a photo, let Gemini diagnose, verify details, and broadcast to IMC department officers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Presets & Image Selector (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] space-y-5 shadow-sm">
            <h3 className="text-sm font-bold font-mono text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Step 1: Upload or Choose Preset</span>
            </h3>

            {/* Simulated file box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden group"
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Incident Preview"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all"
                />
              ) : (
                <div className="space-y-3">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mx-auto" />
                  <div>
                    <span className="block text-xs font-bold text-slate-600">Drag or click to upload photo</span>
                    <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, HEIC up to 10MB</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Preset selectors to demonstrate multi-modal live analysis */}
            <div className="space-y-3">
              <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">
                Or trigger a live preset image for testing:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {HAZARD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    disabled={analyzing}
                    onClick={() => handlePresetSelect(preset)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs text-left transition-all font-semibold disabled:opacity-50"
                  >
                    <img src={preset.url} alt={preset.label} className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white" />
                    <span className="truncate">{preset.label}</span>
                    {presetTriggering === preset.id && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Loader Card */}
          {analyzing && (
            <div className="p-6 rounded-[32px] bg-white border border-slate-100 text-center space-y-4 shadow-md">
              <div className="relative inline-block">
                <Sparkles className="w-10 h-10 text-amber-500 animate-spin-slow mx-auto" />
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin absolute bottom-0 right-0" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Gemini AI Inspecting Image...</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Scanning road pixel topology, determining severity, estimating repair costs, and mapping Indore municipal departments.
                </p>
              </div>
            </div>
          )}

          {/* Preset / Upload Feedback Messages */}
          {errorMessage && (
            <div className="p-4 rounded-[24px] bg-rose-50 border border-rose-100 flex gap-3 text-xs text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {duplicateAlert?.isDuplicate && (
            <div className="p-4 rounded-[24px] bg-amber-50 border border-amber-100 flex gap-3 text-xs text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-550" />
              <div>
                <h5 className="font-bold text-amber-800">Potential Duplicate Detected!</h5>
                <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                  Gemini has flagged a similar report nearby. We recommend checking the Civic Map or upvoting the existing report to help fast-track it.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information form & AI Diagnostics (Span 7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleFormSubmit} className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[32px] space-y-6 shadow-sm">
            <h3 className="text-sm font-bold font-mono text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Step 2: AI Diagnosis & Dispatch Details</span>
            </h3>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase font-bold">Report Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight causing pitch-black pathway"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase font-bold">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, hazards, or impact on traffic/safety..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* AI Diagnostics details block (Grid columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/40">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Broken Streetlight">Broken Streetlight</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Traffic Signal">Traffic Signal</option>
                  <option value="Illegal Dumping">Illegal Dumping</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Tree Fallen">Tree Fallen</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">Estimated Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityType)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">Predicted Resolution</label>
                <input
                  type="text"
                  value={predictedResolutionTime}
                  onChange={(e) => setPredictedResolutionTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">Est. Repair Budget (INR)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">Routed Municipal Division</label>
                <input
                  type="text"
                  value={recommendedDepartment}
                  onChange={(e) => setRecommendedDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>

            {/* Ward selection, Landmark, Address & Geolocation coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase font-bold">Indore Ward Selection</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="Ward 54 (Vijay Nagar)">Ward 54 (Vijay Nagar)</option>
                  <option value="Ward 32 (Palasia)">Ward 32 (Palasia)</option>
                  <option value="Ward 45 (Rajwada)">Ward 45 (Rajwada)</option>
                  <option value="Ward 12 (Bhawarkua)">Ward 12 (Bhawarkua)</option>
                  <option value="Ward 71 (Ranjit Hanuman)">Ward 71 (Ranjit Hanuman)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase font-bold">Nearest Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Chappan Parking"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase font-bold">Incident Location Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Vijay Nagar Sector B, Indore"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Citizen Details / Anonymous trigger toggle */}
            <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="anonymous-toggle" className="text-xs text-slate-500 font-bold cursor-pointer">
                  Hide my name (Post anonymously on Civic Map)
                </label>
              </div>

              {!anonymous && (
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Contact +91 (Optional)"
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || submitSuccess}
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                submitSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-lg shadow-blue-100'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Report Successfully Registered! +150 XP</span>
                </>
              ) : (
                <span>Submit Official Report</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
