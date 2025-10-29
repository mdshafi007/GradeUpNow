import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Minimize2, X, Bot, User } from 'lucide-react';
import './AiChat.css';

const AiChat = ({ isCollapsed = false, onToggleCollapse }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI programming assistant. I can help you with C programming concepts, explain code, debug issues, and answer questions about the tutorial content. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate AI response (replace with actual AI API call)
  const simulateAiResponse = async (userMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple keyword-based responses (replace with actual AI)
    const responses = {
      'hello': "Hello! I'm here to help you with C programming. What would you like to learn about?",
      'variables': "Variables in C are containers for storing data values. They must be declared with a data type like int, float, char, etc. For example: int age = 25;",
      'functions': "Functions in C are blocks of code that perform specific tasks. They help make code modular and reusable. A function has a return type, name, parameters, and body.",
      'loops': "Loops in C allow you to repeat code blocks. The main types are: for loops (when you know iterations), while loops (condition-based), and do-while loops (executes at least once).",
      'arrays': "Arrays in C store multiple values of the same data type in sequential memory locations. Example: int numbers[5] = {1, 2, 3, 4, 5};",
      'pointers': "Pointers in C store memory addresses of variables. They're powerful for dynamic memory allocation and efficient parameter passing. Example: int *ptr = &variable;",
      'help': "I can help you with:\n• C programming concepts\n• Code explanations\n• Debugging assistance\n• Tutorial questions\n• Best practices\n\nJust ask me anything!",
      'default': "That's a great question! While I'm still learning, I can help explain C programming concepts, debug code, and clarify tutorial content. Could you be more specific about what you'd like to know?"
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;

    for (const [keyword, reply] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        response = reply;
        break;
      }
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAiResponse(userMessage);
      const newAiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCollapsed) {
    return (
      <div
        className={`ai-chat-fab ${isMobile ? 'mobile' : 'desktop'}`}
        onClick={onToggleCollapse}
        style={{
          right: isMobile ? '20px' : '20px',
          bottom: '20px'
        }}
      >
        <MessageCircle size={24} color="#ffffff" />
      </div>
    );
  }

  return (
    <div 
      className={`ai-chat-container ${isMobile ? 'mobile' : 'desktop'}`}
      style={{
        right: isMobile ? '10px' : '20px',
        top: isMobile ? '70px' : '80px',
        bottom: isMobile ? '10px' : '20px',
        width: isMobile ? 'calc(100% - 20px)' : '380px'
      }}
    >
      {/* Header */}
      <div className="ai-chat-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div className="ai-chat-avatar">
            <Bot size={18} color="#ffffff" />
          </div>
          <div>
            <h3 className="ai-chat-title">
              AI Assistant
            </h3>
            <p className="ai-chat-status">
              Online
            </p>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="ai-chat-close-btn"
        >
          <Minimize2 size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-chat-message ${message.sender}`}
          >
            <div className={`ai-chat-bubble ${message.sender}`}>
              {message.text}
            </div>
            <div className="ai-chat-timestamp">
              {message.sender === 'ai' ? <Bot size={12} /> : <User size={12} />}
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="ai-chat-typing">
            <div className="ai-chat-typing-bubble">
              <div className="ai-chat-typing-dots">
                <div className="ai-chat-typing-dot"></div>
                <div className="ai-chat-typing-dot"></div>
                <div className="ai-chat-typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="ai-chat-input-area">
        <div className="ai-chat-input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about C programming..."
            className="ai-chat-textarea"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`ai-chat-send-btn ${inputMessage.trim() && !isLoading ? 'enabled' : 'disabled'}`}
          >
            <Send size={16} color={inputMessage.trim() && !isLoading ? '#ffffff' : '#9ca3af'} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AiChat;
