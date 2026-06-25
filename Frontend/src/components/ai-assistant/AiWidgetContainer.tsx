import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Bot, Bell, MessageSquare, History, Sparkles, ShoppingCart, Store, Bike, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'react-router-dom';
import { useDraggable } from '@/hooks/useDraggable';
import { AiChatPanel } from './AiChatPanel';
import { AiHistoryPanel } from './AiHistoryPanel';
import { AiNotificationCenter } from '../notifications/AiNotificationCenter';
import { api as axios } from '@/lib/axios';

interface AiWidgetContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'chat' | 'notifications' | 'history';

export const AiWidgetContainer: React.FC<AiWidgetContainerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { position, onMouseDown, dragRef, isDragging } = useDraggable('ai_widget_window_pos', { x: -24, y: -90 });
  
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (localStorage.getItem('ai_widget_tab') as TabType) || 'chat';
  });
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  const loadSession = async (sid: string) => {
    setSessionId(sid);
    setIsLoading(true);
    try {
      const res = await axios.get(`/ai/chat/history/${sid}`);
      if (res.data.success && res.data.data) {
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load session', err);
    } finally {
      setIsLoading(false);
      setActiveTab('chat');
    }
  };

  const startNewSession = () => {
    setSessionId(Math.random().toString(36).substring(2, 15));
    setMessages([]);
    setActiveTab('chat');
  };

  useEffect(() => {
    localStorage.setItem('ai_widget_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    // _INIT_CHAT_ removed to allow the static Welcome Screen and Quick Actions to render when messages.length === 0
  }, [isOpen]);

  const handleSendMessage = async (userMessage: string, isSilent = false) => {
    if (!isSilent) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    }
    setIsLoading(true);

    try {
      const res = await axios.post('/ai/chat', {
        message: userMessage,
        sessionId,
        pageContext: {
          pathname: location.pathname,
          search: location.search
        }
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.data.reply }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I couldn't reach the AI service right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBranding = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN': 
      case 'ADMIN': 
        return {
          title: 'Marketplace Operations Copilot',
          subtitle: 'Analytics • Governance • Platform Control',
          icon: <Shield className="w-5 h-5" />,
          colorClass: 'bg-gradient-to-r from-purple-600 to-purple-500'
        };
      case 'SELLER': 
        return {
          title: 'Seller Business Assistant',
          subtitle: 'Orders • Revenue • Inventory • Customers',
          icon: <Store className="w-5 h-5" />,
          colorClass: 'bg-gradient-to-r from-green-600 to-green-500'
        };
      case 'RIDER': 
        return {
          title: 'Rider Delivery Assistant',
          subtitle: 'Deliveries • Earnings • Navigation',
          icon: <Bike className="w-5 h-5" />,
          colorClass: 'bg-gradient-to-r from-orange-600 to-orange-500'
        };
      default: 
        return {
          title: 'Marketplace Shopping Assistant',
          subtitle: 'Orders • Shopping • Wallet • Support',
          icon: <ShoppingCart className="w-5 h-5" />,
          colorClass: 'bg-gradient-to-r from-blue-600 to-blue-500'
        };
    }
  };

  const branding = getRoleBranding();

  if (!isOpen) return null;
  if (isMinimized) return null; // Logic handled by launcher in real app

  const baseStyle: React.CSSProperties = isMaximized ? {
    top: 16, left: 16, right: 16, bottom: 16,
    width: 'auto', height: 'auto',
    transform: 'none',
    position: 'fixed'
  } : {
    transform: `translate(${position.x}px, ${position.y}px)`,
    position: 'fixed',
    bottom: 0, right: 0,
    resize: 'both',
    overflow: 'hidden'
  };

  return (
    <div
      ref={dragRef}
      style={baseStyle}
      className={`bg-surface shadow-2xl border border-border flex flex-col z-50 animate-in slide-in-from-bottom-5 
        w-full h-[80vh] rounded-t-2xl sm:rounded-2xl
        sm:w-[320px] sm:h-[70vh] 
        md:w-[340px] md:h-[75vh] 
        lg:w-[380px] lg:max-h-[650px]
        ${isDragging ? 'opacity-95' : ''}`}
    >
      {/* Smart Header (Draggable) */}
      <div 
        className={`py-2 px-3 h-[56px] ${branding.colorClass} text-white flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0`}
        onMouseDown={!isMaximized ? onMouseDown : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
            {branding.icon}
          </div>
          <div className="leading-tight">
            <h3 className="font-bold text-sm tracking-wide">{branding.title}</h3>
            <p className="text-[9px] opacity-90 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> {branding.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface border-b border-border shrink-0">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-sm font-semibold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'}`}
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-sm font-semibold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' && (
          <AiChatPanel messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />
        )}
        {activeTab === 'history' && (
          <AiHistoryPanel 
            currentSessionId={sessionId} 
            onSelectSession={loadSession} 
            onNewChat={startNewSession} 
          />
        )}
      </div>
    </div>
  );
};
