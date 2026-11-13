import { useState, useEffect } from 'react';
import { Bookmark, Folder, Tag, Check, Sparkles, ExternalLink } from 'lucide-react';

export default function Popup() {
  const [tabInfo, setTabInfo] = useState<{ title: string; url: string; favIconUrl?: string }>({
    title: 'Loading current tab...',
    url: '',
  });
  const [selectedFolder, setSelectedFolder] = useState('1');
  const [tags, setTags] = useState('development, research');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If in Chrome extension environment, query active tab
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setTabInfo({
            title: tabs[0].title || 'Untitled Web Page',
            url: tabs[0].url || '',
            favIconUrl: tabs[0].favIconUrl,
          });
        }
      });
    } else {
      // Browser fallback for local preview testing
      setTabInfo({
        title: 'Building Better APIs — Practical REST Design',
        url: 'https://example.dev/article/building-better-apis',
      });
    }
  }, []);

  const handleArchive = async () => {
    setLoading(true);
    // Simulating API dispatch to NestJS backend POST /api/v1/resources
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 700);
  };

  return (
    <div className="w-[360px] p-5 bg-slate-900 text-slate-100 flex flex-col space-y-4">
      {/* Extension Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">ARCIVO</h1>
            <p className="text-[10px] text-slate-400">Quick Web Clipper</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
          Connected
        </span>
      </div>

      {/* Captured Webpage Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xs font-semibold text-slate-200 line-clamp-2">{tabInfo.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
          <ExternalLink className="w-3 h-3 flex-shrink-0 text-indigo-400" />
          <span className="truncate">{tabInfo.url}</span>
        </div>
        <div className="pt-1 flex items-center gap-1 text-[10px] text-indigo-300">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Extracts clean reader mode & metadata</span>
        </div>
      </div>

      {/* Destination Folder Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-indigo-400" />
          Save to Folder
        </label>
        <select 
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="1">📁 Web Development</option>
          <option value="2">📁 University</option>
          <option value="3">📁 Research</option>
          <option value="4">📁 Inspiration</option>
        </select>
      </div>

      {/* Tags Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          Tags (comma separated)
        </label>
        <input 
          type="text" 
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="api, backend, architecture"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Save Action Button */}
      <button 
        onClick={handleArchive}
        disabled={loading || saved}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
          saved 
            ? 'bg-emerald-600 text-white' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
        }`}>
        {saved ? (
          <>
            <Check className="w-4 h-4" /> Saved to Arcivo!
          </>
        ) : loading ? (
          <span>Archiving page...</span>
        ) : (
          <>
            <Bookmark className="w-4 h-4" /> Archive This Page
          </>
        )}
      </button>

      <div className="pt-2 border-t border-white/10 text-center">
        <a 
          href="http://localhost:5173" 
          target="_blank" 
          rel="noreferrer"
          className="text-[11px] text-slate-400 hover:text-indigo-300 transition-colors">
          Open Arcivo Workspace ↗
        </a>
      </div>
    </div>
  );
}

