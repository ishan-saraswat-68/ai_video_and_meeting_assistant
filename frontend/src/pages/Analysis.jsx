import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getSession } from '../api/client';
import Navbar from '../components/Navbar';
import ChatPane from '../components/ChatPane';
import { TextContent } from '../components/TextContent';
import ReactMarkdown from 'react-markdown';
import {
  Play,
  LayoutDashboard,
  FileText,
  ListChecks,
  Brain,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Globe,
  Video,
  ArrowRight
} from 'lucide-react';

const NAV_SECTIONS = [
  { id: 'overview',    label: 'Overview',         icon: LayoutDashboard },
  { id: 'transcript', label: 'Full Transcript',   icon: FileText },
  { id: 'actions',    label: 'Action Items',      icon: ListChecks },
  { id: 'decisions',  label: 'Key Decisions',     icon: Brain },
  { id: 'questions',  label: 'Open Questions',    icon: HelpCircle },
  { id: 'chat',       label: 'Chat with Video',   icon: MessageSquare },
];

/* ---- Helper: Copy-to-clipboard button ---- */
function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for unsupported environments
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191A23] hover:bg-[#292A33] border border-[#292A33] text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] transition-all cursor-pointer"
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
      ) : (
        <><Copy className="w-3.5 h-3.5" /><span>{label}</span></>
      )}
    </button>
  );
}

/* ---- Section: Overview ---- */
function OverviewSection({ data, setActiveSection }) {
  return (
    <div className="space-y-8">
      {/* Video Info Header */}
      <div className="p-5 rounded-2xl bg-[#14151C] border border-[#292A33] space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A855F7] uppercase tracking-wider">
              <Video className="w-3.5 h-3.5" />
              <span>AI Analysis Ready</span>
            </div>
            <h2 className="text-xl font-bold text-[#F8FAFC] leading-snug">{data.title || 'Untitled Video'}</h2>
          </div>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Ready
          </span>
        </div>
        <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Session ID: <span className="font-mono text-[#71717A]">{data.session_id?.slice(0, 8)}...</span></span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            Executive & Technical Summary
          </h3>
          <CopyButton text={data.summary} label="Copy Summary" />
        </div>
        <div className="p-5 rounded-2xl bg-[#14151C] border border-[#292A33]">
          <TextContent content={data.summary} emptyMessage="No summary was generated." />
        </div>
      </div>

      {/* Quick-access cards */}
      <div>
        <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-4">Jump to Sections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'transcript', icon: FileText, label: 'Full Transcript', color: 'blue' },
            { id: 'actions',    icon: ListChecks, label: 'Action Items', color: 'green' },
            { id: 'chat',       icon: MessageSquare, label: 'Chat with Video', color: 'purple' },
          ].map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className="flex items-center justify-between p-4 rounded-xl bg-[#14151C] hover:bg-[#191A23] border border-[#292A33] hover:border-purple-500/30 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  color === 'purple' ? 'bg-purple-500/10 text-purple-400' 
                  : color === 'blue' ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#A1A1AA] group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Section: Full Transcript ---- */
function TranscriptSection({ data }) {
  const [search, setSearch] = useState('');
  const text = data.transcript || '';
  const lines = text.split('\n');

  const filteredLines = search.trim()
    ? lines.filter(line => line.toLowerCase().includes(search.toLowerCase()))
    : lines;

  const highlightMatch = (line, query) => {
    if (!query) return line;
    const parts = line.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Full Transcript
        </h3>
        <CopyButton text={text} label="Copy Transcript" />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
        <input
          type="text"
          placeholder="Search transcript..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#191A23] border border-[#292A33] text-[#F8FAFC] text-sm placeholder-[#71717A] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
        {search && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A]">
            {filteredLines.filter(l => l.trim()).length} matches
          </span>
        )}
      </div>

      {/* Transcript content */}
      <div className="p-5 rounded-2xl bg-[#14151C] border border-[#292A33] max-h-[60vh] overflow-y-auto space-y-2">
        {!text ? (
          <p className="text-sm text-[#71717A] italic">No transcript available.</p>
        ) : filteredLines.filter(l => l.trim()).length === 0 ? (
          <p className="text-sm text-[#71717A] italic">No matching lines found for "{search}".</p>
        ) : (
          filteredLines
            .filter(l => l.trim())
            .map((line, i) => (
              <p key={i} className="text-sm text-[#A1A1AA] leading-relaxed">
                {highlightMatch(line, search)}
              </p>
            ))
        )}
      </div>
    </div>
  );
}

/* ---- Section: Generic list (Actions / Decisions / Questions) ---- */
function ListSection({ title, icon: Icon, content, emptyMessage, copyLabel, accentColor = 'purple' }) {
  const colorMap = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    green:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    blue:   { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    amber:  { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  };
  const c = colorMap[accentColor] || colorMap.purple;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${c.bg} flex items-center justify-center ${c.text}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          {title}
        </h3>
        {content && <CopyButton text={content} label={copyLabel || 'Copy'} />}
      </div>
      <div className="p-5 rounded-2xl bg-[#14151C] border border-[#292A33]">
        <TextContent content={content} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}

/* ---- Main Analysis Page ---- */
export default function Analysis() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(location.state?.initialData || null);
  const [isLoading, setIsLoading] = useState(!location.state?.initialData);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch session if we landed directly (e.g. page refresh)
  useEffect(() => {
    if (!data && sessionId) {
      setIsLoading(true);
      getSession(sessionId)
        .then(result => setData(result))
        .catch(err => setError(err.message || 'Could not load session data.'))
        .finally(() => setIsLoading(false));
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090D] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#A855F7] mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#F8FAFC]">Loading Analysis...</p>
              <p className="text-sm text-[#71717A] mt-1">Fetching session from backend.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08090D] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#F8FAFC]">Session Not Found</p>
              <p className="text-sm text-[#A1A1AA] mt-1">{error}</p>
            </div>
            <Link
              to="/get-started"
              className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const titleTruncated = data?.title
    ? data.title.length > 50 ? data.title.slice(0, 50) + '…' : data.title
    : 'Analysis Workspace';

  const navbarRight = (
    <div className="flex items-center gap-3">
      <Link
        to="/get-started"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#191A23] hover:bg-[#292A33] border border-[#292A33] text-sm font-medium text-[#F8FAFC] transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Analysis</span>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col">
      <Navbar customRightAction={navbarRight} />

      {/* Video title strip */}
      <div className="border-b border-[#292A33] bg-[#0D0E14] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            className="w-8 h-8 rounded-lg bg-[#14151C] border border-[#292A33] flex items-center justify-center text-[#A1A1AA] hover:text-[#F8FAFC] shrink-0 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Video className="w-4 h-4 text-[#A855F7] shrink-0" />
            <h1 className="text-sm font-semibold text-[#F8FAFC] truncate">{titleTruncated}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ready</span>
        </div>
      </div>

      {/* Workspace Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left Sidebar */}
        {sidebarOpen && (
          <aside className="w-56 shrink-0 border-r border-[#292A33] bg-[#0D0E14] flex flex-col overflow-y-auto">
            <nav className="p-3 space-y-1 flex-1">
              {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                      active
                        ? 'bg-purple-500/15 text-[#F8FAFC] border border-purple-500/30'
                        : 'text-[#A1A1AA] hover:bg-[#14151C] hover:text-[#F8FAFC] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#A855F7]' : ''}`} />
                    <span>{label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-purple-400" />}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content Panel */}
        <main className={`flex-1 min-h-0 overflow-auto flex flex-col ${activeSection === 'chat' ? '' : ''}`}>
          {activeSection !== 'chat' ? (
            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl w-full">
              {activeSection === 'overview' && (
                <OverviewSection data={data} setActiveSection={setActiveSection} />
              )}
              {activeSection === 'transcript' && (
                <TranscriptSection data={data} />
              )}
              {activeSection === 'actions' && (
                <ListSection
                  title="Action Items"
                  icon={ListChecks}
                  content={data.action_items}
                  emptyMessage="No action items were identified in this video."
                  copyLabel="Copy Items"
                  accentColor="green"
                />
              )}
              {activeSection === 'decisions' && (
                <ListSection
                  title="Key Decisions"
                  icon={Brain}
                  content={data.key_decisions}
                  emptyMessage="No key decisions were found in this video."
                  copyLabel="Copy Decisions"
                  accentColor="blue"
                />
              )}
              {activeSection === 'questions' && (
                <ListSection
                  title="Open Questions"
                  icon={HelpCircle}
                  content={data.open_questions}
                  emptyMessage="No open questions were identified."
                  copyLabel="Copy Questions"
                  accentColor="amber"
                />
              )}
            </div>
          ) : (
            /* Chat takes full height */
            <div className="flex-1 flex flex-col min-h-0 h-full">
              <div className="px-6 py-4 border-b border-[#292A33] shrink-0">
                <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Chat with Video
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">Answers are grounded strictly in the transcript via RAG.</p>
              </div>
              <div className="flex-1 min-h-0">
                <ChatPane sessionId={data.session_id} />
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
