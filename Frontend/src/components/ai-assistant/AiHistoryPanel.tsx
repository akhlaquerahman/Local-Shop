import React, { useState, useEffect } from 'react';
import { History, MessageSquare, MoreVertical, Edit2, Trash2, Plus } from 'lucide-react';
import { api as axios } from '@/lib/axios';

interface AiHistoryPanelProps {
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

interface HistoryItem {
  _id: string;
  sessionId: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export const AiHistoryPanel: React.FC<AiHistoryPanelProps> = ({ currentSessionId, onSelectSession, onNewChat }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/ai/chat/history');
      if (res.data.success) {
        setHistoryItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const startRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentTitle);
    setActiveMenuId(null);
  };

  const saveRename = async (e: React.KeyboardEvent | React.FocusEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    
    // Optimistic UI update
    setHistoryItems(items => items.map(item => 
      item.sessionId === renamingId ? { ...item, title: renameValue } : item
    ));
    
    try {
      await axios.put(`/ai/chat/history/${renamingId}/title`, { title: renameValue });
    } catch (err) {
      console.error('Rename failed', err);
      fetchHistory(); // Revert on failure
    }
    setRenamingId(null);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    const targetId = deleteModalId;
    
    setHistoryItems(items => items.filter(item => item.sessionId !== targetId));
    setDeleteModalId(null);
    setActiveMenuId(null);

    try {
      await axios.delete(`/ai/chat/history/${targetId}`);
      if (currentSessionId === targetId) {
        onNewChat(); // Clear if deleting active chat
      }
    } catch (err) {
      console.error('Delete failed', err);
      fetchHistory(); // Revert
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes || 1} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="p-4 border-b border-border bg-surface flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text">History</h3>
        </div>
        <button 
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-border" onClick={() => setActiveMenuId(null)}>
        {isLoading ? (
          <div className="flex justify-center p-6"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : historyItems.length === 0 ? (
          <div className="text-center mt-12 px-4">
            <MessageSquare className="w-8 h-8 text-border mx-auto mb-3" />
            <p className="text-sm text-text-secondary font-medium">No conversations yet.</p>
            <p className="text-xs text-text-secondary mt-1.5 opacity-80">Start a new conversation using the New Chat button.</p>
          </div>
        ) : (
          historyItems.map(item => {
            const isActive = currentSessionId === item.sessionId;
            
            return (
              <div 
                key={item.sessionId} 
                onClick={() => onSelectSession(item.sessionId)}
                className={`relative p-3 border rounded-xl cursor-pointer transition-all group
                  ${isActive 
                    ? 'bg-primary/5 border-primary/30 shadow-[inset_2px_0_0_0_theme(colors.primary.DEFAULT)]' 
                    : 'bg-surface border-border hover:border-primary/40'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                    
                    {renamingId === item.sessionId ? (
                      <input 
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={saveRename}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 min-w-0 bg-background border border-primary/50 rounded px-2 py-0.5 text-sm font-medium text-text focus:outline-none"
                      />
                    ) : (
                      <span className={`font-medium text-sm truncate ${isActive ? 'text-primary' : 'text-text'}`}>
                        {item.title}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={(e) => toggleMenu(e, item.sessionId)}
                    className={`p-1.5 -m-1 rounded-md transition-colors shrink-0 
                      ${activeMenuId === item.sessionId ? 'opacity-100 bg-background text-text' : 'opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text hover:bg-background'}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === item.sessionId && (
                    <div className="absolute right-2 top-8 w-36 bg-surface border border-border rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                      <button 
                        onClick={(e) => startRename(e, item.sessionId, item.title)}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-text hover:bg-background flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Rename Chat
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteModalId(item.sessionId); setActiveMenuId(null); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-error hover:bg-error/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Chat
                      </button>
                    </div>
                  )}
                </div>
                <p className={`text-xs mt-1.5 pl-6.5 ml-6 ${isActive ? 'text-primary/70' : 'text-text-secondary/70'}`}>
                  {formatTime(item.updatedAt)}
                </p>
              </div>
            );
          })
        )}
      </div>

      {deleteModalId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border rounded-xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-text text-lg">Delete Conversation?</h3>
            <p className="text-sm text-text-secondary mt-2">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setDeleteModalId(null)} className="px-4 py-2 text-sm font-medium text-text border border-border rounded-lg hover:bg-background">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-error rounded-lg hover:bg-error-hover">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
