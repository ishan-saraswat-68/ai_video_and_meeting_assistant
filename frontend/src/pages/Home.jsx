import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  FileText, 
  ListChecks, 
  MessageSquare, 
  GraduationCap, 
  Briefcase, 
  Search, 
  Video
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col selection:bg-purple-500/30 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#292A33]/50">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14151C] border border-[#292A33] text-xs font-medium text-[#A1A1AA]">
                <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                <span className="text-[#F8FAFC]">Fast Subtitle Ingestion & Gemini RAG</span>
                <span className="text-[#292A33]">•</span>
                <span className="text-emerald-400 font-mono text-[11px]">v2.0 Ready</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.12]">
                Turn Hours of Video Into <span className="text-gradient">Minutes of Insights.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#A1A1AA] leading-relaxed max-w-2xl font-normal">
                Transcribe, summarize, extract decisions, and ask questions about your videos and meetings with AI grounded strictly in your transcript.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/get-started"
                  className="btn-gradient inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-base font-semibold text-[#F8FAFC] bg-[#14151C] hover:bg-[#191A23] border border-[#292A33] transition-all"
                >
                  <Play className="w-4 h-4 text-[#A855F7] fill-[#A855F7]" />
                  <span>Watch Demo</span>
                </a>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-[#A1A1AA]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sub-second YouTube subtitles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero hallucination RAG</span>
                </div>
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio & Video upload</span>
                </div>
              </div>
            </div>

            {/* Right Column: Polished Product Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-[#0D0E14] border border-[#292A33] shadow-2xl overflow-hidden p-1.5 group">
                <div className="rounded-xl bg-[#14151C] border border-[#292A33]/70 p-5 space-y-4">
                  
                  {/* Mock Window Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#292A33]/80">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="text-xs font-mono text-[#A1A1AA] ml-2">session_demo_9b1deb4d</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
                      Ready
                    </span>
                  </div>

                  {/* Video Title Header */}
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A855F7] mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span>YouTube Ingestion • 42 mins</span>
                    </div>
                    <h3 className="text-base font-bold text-[#F8FAFC] leading-snug">
                      Master OOP in Java: Comprehensive Architecture & Design Patterns
                    </h3>
                  </div>

                  {/* Short Summary Card */}
                  <div className="p-3.5 rounded-xl bg-[#191A23]/80 border border-[#292A33] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        Executive Summary
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">Scaled to ~320 words</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      Detailed walkthrough of Object-Oriented Principles focusing on encapsulation, abstraction hierarchies, and polymorphism across modular enterprise services.
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-[#34D399]" />
                      Extracted Action Items
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2 text-xs text-[#A1A1AA] bg-[#0D0E14] p-2 rounded-lg border border-[#292A33]/50">
                        <span className="text-[#34D399] font-mono font-bold text-[11px]">01</span>
                        <span>Implement immutable DTOs with private constructor patterns.</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-[#A1A1AA] bg-[#0D0E14] p-2 rounded-lg border border-[#292A33]/50">
                        <span className="text-[#34D399] font-mono font-bold text-[11px]">02</span>
                        <span>Refactor coupling logic using interface segregation.</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Chat Response */}
                  <div className="pt-2 border-t border-[#292A33]/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-purple-500/20 text-[#A855F7] flex items-center justify-center text-[10px] font-bold">
                        Q
                      </div>
                      <span className="text-xs text-[#F8FAFC] font-medium">
                        "What was decided about mutable fields?"
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs text-[#D8B4FE] leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#A855F7] mt-0.5 shrink-0" />
                      <span>
                        The speaker strictly recommended encapsulation with read-only accessors to prevent external state mutation.
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-b border-[#292A33]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-[#A855F7]">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
              Everything you need to master video content.
            </h2>
            <p className="text-base text-[#A1A1AA]">
              Engineered with Gemini multimodal intelligence and high-speed subtitle retrieval pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#A855F7] mb-5 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Smart Summaries</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Dynamically scaled executive summaries that capture technical depth without fluff or redundant prose.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#3B82F6] mb-5 group-hover:scale-105 transition-transform">
                <ListChecks className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Decisions & Actions</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Pinpoint high-priority deliverables, consensus points, and open unanswered questions instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#34D399] mb-5 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Full Transcript Search</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Search through thousands of spoken words with live keyword highlighting and one-click clipboard copying.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#A855F7] mb-5 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Grounded AI Chat</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                RAG conversational agent that answers user queries with strict verification against source audio transcripts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-b border-[#292A33]/50 bg-[#0D0E14]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-[#3B82F6]">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
              How VidAI Works
            </h2>
            <p className="text-base text-[#A1A1AA]">
              From raw media to crystal-clear synthesis in three straightforward stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-[#14151C] border border-[#292A33] relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#191A23] border border-[#292A33] flex items-center justify-center text-sm font-bold font-mono text-[#F8FAFC]">
                01
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Add Video or Media</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Paste any YouTube URL for immediate processing or drop local meeting recordings (.mp4, .mov, .mp3, .wav).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-[#14151C] border border-[#292A33] relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#191A23] border border-[#292A33] flex items-center justify-center text-sm font-bold font-mono text-[#A855F7]">
                02
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">AI Processing</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Our backend fetches transcripts, extracts speech, generates structured notes, and builds vector embeddings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-[#14151C] border border-[#292A33] relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#191A23] border border-[#292A33] flex items-center justify-center text-sm font-bold font-mono text-[#3B82F6]">
                03
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Explore Insights</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Review executive summaries, copy action items, inspect transcripts, and converse in the interactive chat workspace.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 border-b border-[#292A33]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-purple-400">Applications</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
              Built for high-velocity teams & learners
            </h2>
            <p className="text-base text-[#A1A1AA]">
              Accelerate comprehension whether you study, build, or lead.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#A855F7]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Students & Learners</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Digest multi-hour university lectures and tutorials with structured study notes and targeted questions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#3B82F6]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Professionals & PMs</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Turn Zoom and Google Meet recordings into instant meeting minutes, agreed milestones, and action logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#34D399]">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Researchers & Analysts</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Extract empirical findings and citation-ready quotes from academic talks and expert panels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151C] border border-[#292A33] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Content Creators</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Repurpose podcast interviews into show notes, blog drafts, and memorable pull quotes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-b from-[#14151C] to-[#0D0E14] border border-[#292A33] space-y-6 shadow-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#A855F7] px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Immediate Access
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              Ready to understand your next video?
            </h2>
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl mx-auto">
              Drop in a YouTube link or meeting file and get comprehensive executive notes in seconds.
            </p>
            <div className="pt-4 flex justify-center">
              <Link
                to="/get-started"
                className="btn-gradient inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl shadow-purple-500/25 hover:scale-105 transition-all"
              >
                <span>Start Analyzing Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
