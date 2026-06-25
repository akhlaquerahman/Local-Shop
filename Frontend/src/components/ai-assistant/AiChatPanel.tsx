import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Mic, MicOff, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AiVisualizer } from './AiVisualizer';
import { useAuthStore } from '@/store/authStore';

interface AiChatPanelProps {
  messages: { role: string; content: string }[];
  isLoading: boolean;
  onSendMessage: (msg: string) => void;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({ messages, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const actionMapping: Record<string, string> = {
    'My Recent Order': 'What is my recent order?',
    'Track Order': 'Track my latest order',
    'Order History': 'Show my order history',
    'Cancel Order': 'I want to cancel my order',
    'Return Order': 'How do I return an order?',
    'Refund Status': 'Check my refund status',
    'My Profile': 'Show my profile',
    'Wallet Balance': 'Show my wallet balance',
    'Saved Addresses': 'Show my saved addresses',
    'Wishlist': 'Show my wishlist',
    'Shopping Cart': 'Show my shopping cart',
    'Nearby Shops': 'Find nearby shops',
    'Best Deals': 'What are the best deals near me?',
    'Create Ticket': 'Create a support ticket',
    'Contact Support': 'I need to contact support',
    "Today's Orders": "Show today's orders",
    "Pending Orders": "Show pending orders",
    "Weekly Revenue": "Show my weekly revenue",
    "Low Stock Products": "Which products are low on stock?",
    "Inventory Status": "Show inventory status",
    "Create Coupon": "I want to create a coupon",
    "Customer Reviews": "Show my customer reviews",
    "Delivery Requests": "Show delivery requests",
    "Request Payout": "I want to request a payout",
    "Today's Deliveries": "Show today's deliveries",
    "Pending Pickups": "Show pending pickups",
    "My Earnings": "Show my earnings",
    "Ratings": "Show my ratings",
    "Failed Deliveries": "Show failed deliveries",
    "Navigate To Pickup": "Navigate to my next pickup",
    "Navigate To Customer": "Navigate to the customer",
    "Platform Health": "Show platform health",
    "GMV Today": "What is the GMV today?",
    "Revenue Report": "Generate a revenue report",
    "Pending KYC": "Show pending KYC approvals",
    "Fraud Cases": "Show fraud cases",
    "Top Sellers": "Who are the top sellers?",
    "Top Cities": "What are the top cities?",
    "Analytics": "Show marketplace analytics",
    "Generate Report": "Generate an admin report"
  };

  const getCategorizedActions = () => {
    // Make sure role is uppercase and defaults to USER
    const role = String(user?.role || 'USER').toUpperCase();
    
    if (role === 'CUSTOMER' || role === 'USER') {
      return [
        { category: 'Orders', items: ['My Recent Order', 'Track Order', 'Order History', 'Cancel Order', 'Return Order', 'Refund Status'] },
        { category: 'Account', items: ['My Profile', 'Wallet Balance', 'Saved Addresses'] },
        { category: 'Shopping', items: ['Wishlist', 'Shopping Cart', 'Nearby Shops', 'Best Deals'] },
        { category: 'Support', items: ['Create Ticket', 'Contact Support'] }
      ];
    }
    if (role === 'SELLER') {
      return [
        { category: 'Sales', items: ["Today's Orders", 'Pending Orders', 'Weekly Revenue'] },
        { category: 'Inventory', items: ['Low Stock Products', 'Inventory Status'] },
        { category: 'Customers', items: ['Create Coupon', 'Customer Reviews'] },
        { category: 'Logistics', items: ['Delivery Requests', 'Request Payout'] }
      ];
    }
    if (role === 'RIDER' || role === 'DELIVERY_PARTNER') {
      return [
        { category: 'Deliveries', items: ["Today's Deliveries", 'Pending Pickups', 'Failed Deliveries'] },
        { category: 'Navigation', items: ['Navigate To Pickup', 'Navigate To Customer'] },
        { category: 'Account', items: ['My Earnings', 'Wallet Balance', 'Ratings'] }
      ];
    }
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return [
        { category: 'Overview', items: ['Platform Health', 'GMV Today', 'Revenue Report'] },
        { category: 'Moderation', items: ['Pending KYC', 'Fraud Cases'] },
        { category: 'Insights', items: ['Top Sellers', 'Top Cities', 'Analytics', 'Generate Report'] }
      ];
    }
    return [];
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\\n/g, '');
            if (!inline && (match?.[1] === 'json-action' || match?.[1] === 'json' || className === 'language-json' || className === 'language-json-action' || codeString.includes('{"_type":'))) {
              try {
                const payload = JSON.parse(codeString);
                if (payload._type) {
                  return <AiVisualizer payload={payload} />;
                }
              } catch (e) {
                // fallback
              }
            }
            return <code className={className} {...props}>{children}</code>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const categories = getCategorizedActions();
  const showWelcome = messages.length === 0;

  const handleActionClick = (label: string) => {
    const prompt = actionMapping[label] || label;
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {showWelcome && (
          <div className="space-y-4 max-w-sm mx-auto mt-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-text mb-1">Hello {user?.name?.split(' ')[0] || 'User'} 👋</h2>
              <p className="text-xs text-text-secondary">How can I help today?</p>
            </div>

            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div key={idx}>
                  <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">{cat.category}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => handleActionClick(item)}
                        className="px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-text hover:bg-primary hover:text-white hover:border-primary transition-colors text-left"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-2.5 ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-surface border border-border text-text rounded-bl-none shadow-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-pre:bg-background prose-pre:border prose-pre:border-border">
                  {renderMarkdown(msg.content)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-none p-2.5 text-text-secondary flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 bg-surface border-t border-border shrink-0">
        <div className="relative flex items-center bg-background border border-border rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <button className="absolute left-1.5 p-1 text-text-secondary hover:text-primary transition-colors">
             <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask AI...`}
            className="w-full bg-transparent border-none pl-8 pr-16 py-2.5 text-sm focus:outline-none resize-none max-h-32 min-h-[40px]"
            rows={1}
            style={{ overflowY: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <div className="absolute right-1.5 flex items-center gap-0.5">
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <button 
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg transition-colors ${isListening ? 'text-error bg-error/10 animate-pulse' : 'text-text-secondary hover:bg-surface-hover hover:text-text'}`}
                title="Voice Input"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
            )}
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-1.5 text-white bg-primary rounded-lg disabled:opacity-50 hover:bg-primary-hover transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
