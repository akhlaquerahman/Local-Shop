import React, { useState, useEffect } from 'react';
import { AiWidgetLauncher } from './AiWidgetLauncher';
import { AiWidgetContainer } from './AiWidgetContainer';

export const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('ai_widget_is_open') === 'true';
  });
  
  const [hasUnread, setHasUnread] = useState(true); // Mock unread notification

  useEffect(() => {
    localStorage.setItem('ai_widget_is_open', String(isOpen));
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AiWidgetLauncher isOpen={isOpen} onToggle={toggleWidget} hasUnread={hasUnread} />
      <AiWidgetContainer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AiChatWidget;
