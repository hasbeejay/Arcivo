import { useState } from 'react';
import { 
  Folder as FolderIcon, 
  Bookmark, 
  Clock, 
  Star, 
  Search, 
  Plus, 
  FileText, 
  Compass, 
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  List
} from 'lucide-react';
import { Resource, Folder } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'favorites' | 'recent' | 'notes'>('workspace');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSaverOpen, setIsSaverOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Sample seed data representing what the backend will deliver
  const folders: Folder[] = [
    { id: '1', name: 'Web Development', color: '#6366F1', icon: 'folder', createdAt: new Date().toISOString(), _count: { resources: 24 } },
    { id: '2', name: 'University', color: '#EC4899', icon: 'folder', createdAt: new Date().toISOString(), _count: { resources: 31 } },
    { id: '3', name: 'Research', color: '#10B981', icon: 'folder', createdAt: new Date().toISOString(), _count: { resources: 18 } },
    { id: '4', name: 'Inspiration', color: '#F59E0B', icon: 'folder', createdAt: new Date().toISOString(), _count: { resources: 12 } },
  ];

  const recentResources: Resource[] = [
    {
      id: 'res-1',
      url: 'https://example.dev/building-better-apis',
      title: 'Building Better APIs',
      description: 'A practical guide to designing reliable, maintainable APIs with clear boundaries and predictable responses.',
      thumbnailUrl: '',
      resourceType: 'article',
      isFavorite: true,
      isArchived: false,
      folderId: '1',
      createdAt: '2026-11-12T10:00:00Z',
      updatedAt: '2026-11-12T10:00:00Z'
    },
    {
      id: 'res-2',
      url: 'https://youtube.com/watch?v=example',
      title: '.NET 10 Full Course',
      description: 'Comprehensive 4h deep-dive into backend architecture, microservices and performant endpoints.',
      thumbnailUrl: '',
      resourceType: 'video',
      isFavorite: false,
      isArchived: false,
      folderId: '1',
      createdAt: '2026-11-11T14:30:00Z',
      updatedAt: '2026-11-11T14:30:00Z'
    },
    {
      id: 'res-3',
      url: 'https://css-tricks.com/patterns',
      title: 'Modern CSS Patterns & Glassmorphism',
      description: 'Creating depth, backdrop filters, and fluid layouts for desktop-grade web applications.',
      thumbnailUrl: '',
      resourceType: 'article',
      isFavorite: true,
      isArchived: false,
      folderId: '4',
      createdAt: '2026-11-10T09:15:00Z',
      updatedAt: '2026-11-10T09:15:00Z'
    }
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      {/* 1. macOS Top Menu Bar */}
      <header className="h-8 w-full bg-slate-900/40 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between text-xs font-medium z-50">
        <div className="flex items-center space-x-4">
          <span className="font-bold tracking-wider text-indigo-400">ARCIVO</span>
          <span className="text-slate-400 hover:text-slate-200 cursor-pointer">File</span>
          <span className="text-slate-400 hover:text-slate-200 cursor-pointer">Edit</span>
          <span className="text-slate-400 hover:text-slate-200 cursor-pointer">View</span>
          <span className="text-slate-400 hover:text-slate-200 cursor-pointer">Window</span>
          <span className="text-slate-400 hover:text-slate-200 cursor-pointer">Help</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center gap-1 text-[11px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sync Active
          </span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 pb-20">
        {/* Finder Sidebar */}
        <aside className="w-64 glass-panel rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
          <div className="space-y-6">
            {/* Quick Navigation */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Favorites</p>
              <nav className="space-y-1">
                <button 
                  onClick={() => { setActiveTab('workspace'); setSelectedFolder(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'workspace' && !selectedFolder ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-white/5'}`}>
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Home
                </button>
                <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-white/5'}`}>
                  <Star className="w-4 h-4 text-amber-400" />
                  Favorites
                </button>
                <button 
                  onClick={() => setActiveTab('recent')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'recent' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-white/5'}`}>
                  <Clock className="w-4 h-4 text-sky-400" />
                  Recent
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'notes' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-white/5'}`}>
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Notes
                </button>
              </nav>
            </div>

            {/* Folders List */}
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Folders</p>
                <button className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => { setSelectedFolder(folder.id); setActiveTab('workspace'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${selectedFolder === folder.id ? 'bg-white/15 text-white font-semibold' : 'text-slate-300 hover:bg-white/5'}`}>
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderIcon className="w-4 h-4" style={{ color: folder.color }} />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">{folder._count?.resources}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between px-2">
            <span>Arcivo v1.0.0</span>
            <span className="text-[10px] text-indigo-400 font-mono">BSCS 5A</span>
          </div>
        </aside>

        {/* Central Content Area */}
        <main className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {/* Top Explorer Action Bar */}
          <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'Home Workspace'}
              </h2>
              <span className="text-xs bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full">
                {recentResources.length} items
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search resources, tags, notes..." 
                  className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Archive Button */}
              <button 
                onClick={() => setIsSaverOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all">
                <Plus className="w-4 h-4" />
                Archive URL
              </button>
            </div>
          </div>

          {/* Explorer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Folder Grid Section (if on Home) */}
            {!selectedFolder && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Folders</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {folders.map(folder => (
                    <div 
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-white/10" style={{ color: folder.color }}>
                          <FolderIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono text-slate-400">{folder._count?.resources} items</span>
                      </div>
                      <h4 className="font-semibold text-sm group-hover:text-indigo-300 transition-colors">{folder.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">Updated recently</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Cards Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedFolder ? 'Archived Resources' : 'Recently Archived'}
                </h3>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentResources.map(resource => (
                  <div 
                    key={resource.id} 
                    className="group bg-slate-800/50 hover:bg-slate-800/80 border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
                    {/* Visual Card Header */}
                    <div className="h-32 bg-gradient-to-tr from-indigo-600/40 via-purple-600/40 to-pink-500/30 p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-white border border-white/10">
                          {resource.resourceType}
                        </span>
                        <button className="p-1.5 rounded-lg bg-black/40 text-slate-300 hover:text-amber-400 transition-colors">
                          <Star className={`w-3.5 h-3.5 ${resource.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                      <div className="z-10">
                        <p className="text-xs text-white/80 font-mono truncate">{new URL(resource.url).hostname}</p>
                      </div>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">{resource.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{resource.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Added Nov 12</span>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium">
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 3. macOS Floating Dock */}
      <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 glass-dock px-4 py-2 rounded-2xl flex items-center space-x-3 shadow-mac-dock z-40 border border-white/20">
        <button 
          onClick={() => { setActiveTab('workspace'); setSelectedFolder(null); }}
          title="Home Workspace"
          className="p-2.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all transform hover:-translate-y-2 hover:scale-110">
          <Compass className="w-6 h-6 text-indigo-400" />
        </button>
        <button 
          onClick={() => setIsSaverOpen(true)}
          title="New Archive"
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all transform hover:-translate-y-2 hover:scale-110 shadow-lg shadow-indigo-600/40">
          <Plus className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          title="Notes"
          className="p-2.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all transform hover:-translate-y-2 hover:scale-110">
          <FileText className="w-6 h-6 text-emerald-400" />
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          title="Favorites"
          className="p-2.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all transform hover:-translate-y-2 hover:scale-110">
          <Star className="w-6 h-6 text-amber-400" />
        </button>
      </footer>

      {/* Quick Archive Modal */}
      {isSaverOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/20 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-base">Save Something Worth Keeping</h3>
              </div>
              <button 
                onClick={() => setIsSaverOpen(false)}
                className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Paste a URL. Arcivo will automatically retrieve rich metadata, reader snapshot, and prepare an archive resource.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase">Resource URL</label>
                <input 
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase">Save to Folder</label>
                <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase">Personal Note (Optional)</label>
                <textarea 
                  rows={2}
                  placeholder="Why is this resource worth keeping?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Auto-extracts metadata & reading mode
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSaverOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10">
                  Cancel
                </button>
                <button 
                  onClick={() => { setIsSaverOpen(false); setUrlInput(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30">
                  Save to Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

