import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { processUrl, uploadFile } from '../api/client';
import { 
  Link2, 
  Upload, 
  Mic2, 
  FileVideo, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  X, 
  Check, 
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';

export default function GetStarted() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('youtube'); // 'youtube' | 'upload'
  const [language, setLanguage] = useState('english'); // 'english' | 'hinglish'
  
  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Status & processing state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Example Chips
  const exampleChips = [
    { label: 'Lecture', url: 'https://www.youtube.com/watch?v=JWEIdvoz1To' },
    { label: 'Meeting', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Podcast', url: 'https://www.youtube.com/watch?v=b0t3dJvT3e8' },
    { label: 'Interview', url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8' },
  ];

  const handleChipClick = (url) => {
    setYoutubeUrl(url);
    setErrorMessage('');
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.mp4', '.mov', '.mp3', '.wav', '.m4a', '.webm', '.ogg', '.aac', '.mkv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setErrorMessage(`Unsupported format "${fileExt}". Please select an MP4, MOV, MP3, WAV, or M4A file.`);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'youtube') {
      if (!youtubeUrl.trim()) {
        setErrorMessage('Please enter a YouTube video URL.');
        return;
      }

      // Basic YouTube URL regex sanity check
      if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        setErrorMessage('Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=...)');
        return;
      }

      setIsLoading(true);
      setLoadingStage('Connecting to FastAPI backend & retrieving subtitles...');

      try {
        const responseData = await processUrl(youtubeUrl, language);
        if (responseData && responseData.session_id) {
          // Navigate to analysis workspace with state and session_id
          navigate(`/analysis/${responseData.session_id}`, { state: { initialData: responseData } });
        } else {
          throw new Error('Invalid response received from processing endpoint.');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to process YouTube URL. Ensure the backend server is running on port 8000.');
      } finally {
        setIsLoading(false);
        setLoadingStage('');
      }

    } else {
      // Upload mode
      if (!selectedFile) {
        setErrorMessage('Please select or drop an audio or video file to analyze.');
        return;
      }

      setIsLoading(true);
      setLoadingStage(`Uploading ${selectedFile.name} & running audio transcription...`);

      try {
        const responseData = await uploadFile(selectedFile, language);
        if (responseData && responseData.session_id) {
          navigate(`/analysis/${responseData.session_id}`, { state: { initialData: responseData } });
        } else {
          throw new Error('Invalid response received from upload endpoint.');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to upload and process file. Check server logs.');
      } finally {
        setIsLoading(false);
        setLoadingStage('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col selection:bg-purple-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Glow backdrop */}
        <div className="w-full max-w-2xl relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-64 bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="text-center mb-8 relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Let’s Analyze Your Video.
            </h1>
            <p className="text-base text-[#A1A1AA] max-w-lg mx-auto">
              Paste a YouTube link or upload a meeting recording to get started.
            </p>
          </div>

          {/* Main Card Panel */}
          <div className="rounded-2xl bg-[#14151C] border border-[#292A33] shadow-2xl p-6 sm:p-8 relative z-10">
            
            {/* Tabs */}
            <div className="flex rounded-xl bg-[#0D0E14] p-1 border border-[#292A33] mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('youtube'); setErrorMessage(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'youtube'
                    ? 'bg-[#191A23] text-[#F8FAFC] shadow-sm border border-[#292A33]'
                    : 'text-[#A1A1AA] hover:text-[#F8FAFC]'
                }`}
              >
                <Link2 className={`w-4 h-4 ${activeTab === 'youtube' ? 'text-red-400' : ''}`} />
                <span>YouTube URL</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('upload'); setErrorMessage(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#191A23] text-[#F8FAFC] shadow-sm border border-[#292A33]'
                    : 'text-[#A1A1AA] hover:text-[#F8FAFC]'
                }`}
              >
                <Upload className={`w-4 h-4 ${activeTab === 'upload' ? 'text-[#3B82F6]' : ''}`} />
                <span>Upload Recording</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-300">Analysis Error</p>
                  <p className="text-xs text-red-200/90 mt-0.5">{errorMessage}</p>
                </div>
                <button 
                  onClick={() => setErrorMessage('')}
                  className="text-red-400 hover:text-red-200 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* YouTube Tab Content */}
              {activeTab === 'youtube' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="yt-url" className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                      YouTube Video Link
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-400">
                        <Link2 className="w-5 h-5" />
                      </div>
                      <input
                        id="yt-url"
                        type="url"
                        disabled={isLoading}
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#191A23] border border-[#292A33] text-[#F8FAFC] text-sm placeholder-[#71717A] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Example chips */}
                  <div>
                    <div className="text-[11px] font-medium text-[#71717A] mb-2">
                      Quick test samples:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exampleChips.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleChipClick(chip.url)}
                          className="px-2.5 py-1 rounded-lg bg-[#0D0E14] hover:bg-[#191A23] border border-[#292A33] text-xs text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Tab Content */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-purple-500 bg-purple-950/20' 
                        : 'border-[#292A33] hover:border-[#3f4150] bg-[#191A23]/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      disabled={isLoading}
                      accept=".mp4,.mov,.mp3,.wav,.m4a,.webm,.aac"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-xl bg-[#14151C] border border-[#292A33] flex items-center justify-center text-purple-400 mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>

                    <p className="text-sm font-semibold text-[#F8FAFC] mb-1">
                      Click to browse or drag and drop recording
                    </p>
                    <p className="text-xs text-[#71717A]">
                      Supported formats: MP4, MOV, MP3, WAV, M4A, WEBM
                    </p>
                  </div>

                  {/* Selected File Details */}
                  {selectedFile && (
                    <div className="p-3.5 rounded-xl bg-[#0D0E14] border border-[#292A33] flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                          {selectedFile.type.includes('video') ? (
                            <FileVideo className="w-5 h-5" />
                          ) : (
                            <Mic2 className="w-5 h-5" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-[#A1A1AA]">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-[#71717A] hover:text-red-400 p-1.5 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Language Selector */}
              <div className="pt-2 border-t border-[#292A33]/70">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                  Language Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    language === 'english'
                      ? 'bg-purple-950/20 border-purple-500/60 text-[#F8FAFC]'
                      : 'bg-[#191A23] border-[#292A33] text-[#A1A1AA] hover:border-[#3f4150]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">English</span>
                      <span className="text-[10px] text-[#71717A]">(Auto / Standard)</span>
                    </div>
                    <input
                      type="radio"
                      name="language"
                      value="english"
                      checked={language === 'english'}
                      onChange={() => setLanguage('english')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    language === 'hinglish'
                      ? 'bg-purple-950/20 border-purple-500/60 text-[#F8FAFC]'
                      : 'bg-[#191A23] border-[#292A33] text-[#A1A1AA] hover:border-[#3f4150]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Hinglish</span>
                      <span className="text-[10px] text-[#71717A]">(Hindi + English)</span>
                    </div>
                    <input
                      type="radio"
                      name="language"
                      value="hinglish"
                      checked={language === 'hinglish'}
                      onChange={() => setLanguage('hinglish')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-gradient py-3.5 px-6 rounded-xl font-semibold text-white text-base shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{loadingStage || 'Processing Analysis Pipeline...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Video</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
