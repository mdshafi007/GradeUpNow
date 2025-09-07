import React, { useState } from 'react';
import { X } from 'lucide-react';
import './AIChatSidebar.css';

const AIChatSidebar = ({ isMobileView = false, mobileAIChatOpen = false, closeMobileAIChat }) => {
  const [isExpanded, setIsExpanded] = useState(!isMobileView); // Start expanded on desktop, collapsed on mobile
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      // Simulate AI response (since no API integration yet)
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: "I understand your question. This is a placeholder response since AI integration is not yet implemented. I'll be able to provide better assistance once connected to an AI service.",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside 
      className={`right-sidebar ${isExpanded || isMobileView ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => !isMobileView && setIsExpanded(true)}
      onMouseLeave={() => !isMobileView && setIsExpanded(false)}
      style={isMobileView ? {
        right: mobileAIChatOpen ? '0' : '-100%',
        width: '280px',
        transition: 'right 0.3s ease',
        zIndex: 900
      } : {}}
    >
      <div className="sidebar-header">
        {(isExpanded || isMobileView) ? (
          <div className="ai-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1C14.45 1 14 1.45 14 2V4C14 4.55 13.55 5 13 5H11C10.45 5 10 4.55 10 4V2C10 1.45 9.55 1 9 1L3 7V9C3 9.55 3.45 10 4 10H20C20.55 10 21 9.55 21 9ZM11 16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16V20C13 20.55 12.55 21 12 21C11.45 21 11 20.55 11 20V16ZM7.5 14C8.33 14 9 14.67 9 15.5C9 16.33 8.33 17 7.5 17C6.67 17 6 16.33 6 15.5C6 14.67 6.67 14 7.5 14ZM16.5 14C17.33 14 18 14.67 18 15.5C18 16.33 17.33 17 16.5 17C15.67 17 15 16.33 15 15.5C15 14.67 15.67 14 16.5 14Z" 
                fill="currentColor"
              />
            </svg>
            <span>AI Assistant</span>
          </div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1C14.45 1 14 1.45 14 2V4C14 4.55 13.55 5 13 5H11C10.45 5 10 4.55 10 4V2C10 1.45 9.55 1 9 1L3 7V9C3 9.55 3.45 10 4 10H20C20.55 10 21 9.55 21 9ZM11 16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16V20C13 20.55 12.55 21 12 21C11.45 21 11 20.55 11 20V16ZM7.5 14C8.33 14 9 14.67 9 15.5C9 16.33 8.33 17 7.5 17C6.67 17 6 16.33 6 15.5C6 14.67 6.67 14 7.5 14ZM16.5 14C17.33 14 18 14.67 18 15.5C18 16.33 17.33 17 16.5 17C15.67 17 15 16.33 15 15.5C15 14.67 15.67 14 16.5 14Z" 
              fill="currentColor"
            />
          </svg>
        )}
      </div>

      {(isExpanded || isMobileView) && (
        <div className="sidebar-content">
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="timestamp">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <div className="chat-input">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="send-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="disclaimer">
              AI responses are simulated. Integration pending.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AIChatSidebar;
