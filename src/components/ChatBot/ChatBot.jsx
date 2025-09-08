import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import './ChatBot.css';

const ChatBot = ({ isExpanded, onToggle, currentLesson, courseTitle }) => {
  console.log('ChatBot rendering:', { isExpanded, currentLesson: currentLesson?.title, courseTitle });
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hi! I'm your learning assistant for ${courseTitle || 'C Programming'}. I can help you understand concepts from the current lesson "${currentLesson?.title || 'Introduction to C'}", answer questions, or provide coding examples. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when lesson changes
  useEffect(() => {
    if (currentLesson?.title) {
      setMessages(prev => {
        const updatedMessages = [...prev];
        if (updatedMessages.length > 0) {
          updatedMessages[0] = {
            ...updatedMessages[0],
            content: `Hi! I'm your learning assistant for ${courseTitle || 'C Programming'}. I can help you understand concepts from the current lesson "${currentLesson.title}", answer questions, or provide coding examples. How can I help you today?`
          };
        }
        return updatedMessages;
      });
    }
  }, [currentLesson?.title, courseTitle]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    const lessonTitle = currentLesson?.title?.toLowerCase() || '';
    
    // Context-aware responses based on current lesson
    if (lessonTitle.includes('variable') && (input.includes('variable') || input.includes('data type'))) {
      return `Great question about variables from the current lesson "${currentLesson.title}"!\n\nVariables in C are containers that store data values. The main data types are:\n\n• int - for integers (whole numbers)\n• float - for decimal numbers\n• char - for single characters\n• double - for high precision decimals\n\nWould you like me to explain any specific data type from the lesson?`;
    } else if (lessonTitle.includes('history') && input.includes('history')) {
      return `You're studying the history of C! Here are key points:\n\n• C was developed by Dennis Ritchie at Bell Labs in 1972\n• It evolved from the B programming language\n• First appeared in "The C Programming Language" book (1978)\n• Became the foundation for many modern languages\n\nWhat specific aspect of C's history interests you?`;
    } else if (input.includes('current lesson') || input.includes('this lesson')) {
      return `You're currently studying: "${currentLesson?.title || 'Introduction to C'}"\n\n${currentLesson?.description || 'This lesson covers fundamental C programming concepts.'}\n\nThe main learning objectives are:\n${currentLesson?.objectives?.map(obj => `• ${obj}`).join('\n') || '• Understanding basic C concepts'}\n\nWhat specific part would you like help with?`;
    } else if (input.includes('variable') || input.includes('data type')) {
      return 'Variables in C are containers that store data values. The main data types are:\n\n• int - for integers (whole numbers)\n• float - for decimal numbers\n• char - for single characters\n• double - for high precision decimals\n\nWould you like me to show you some examples?';
    } else if (input.includes('pointer')) {
      return 'Pointers are variables that store memory addresses of other variables. They\'re powerful but require careful handling:\n\n```c\nint x = 10;\nint *ptr = &x; // ptr points to x\nprintf("%d", *ptr); // prints 10\n```\n\nNeed help with pointer concepts?';
    } else if (input.includes('loop') || input.includes('for') || input.includes('while')) {
      return 'C has three main types of loops:\n\n• for loop - when you know iteration count\n• while loop - condition checked before execution\n• do-while loop - condition checked after execution\n\nWhich loop type would you like to learn about?';
    } else if (input.includes('hello') || input.includes('hi')) {
      return `Hello! I'm here to help you with ${courseTitle || 'C programming'}. Feel free to ask about:\n\n• Current lesson: "${currentLesson?.title || 'Introduction to C'}"\n• Syntax and concepts\n• Code examples\n• Debugging help\n\nWhat would you like to learn?`;
    } else if (input.includes('help')) {
      return 'I can assist you with:\n\n📚 **Current lesson** - Questions about what you\'re studying\n💻 **Code examples** - Practical coding demonstrations\n🐛 **Debugging** - Help fix your code issues\n📖 **Concepts** - Variables, functions, loops, etc.\n\nJust ask me anything!';
    } else {
      return `That's a great question! While I'm learning to better understand all programming concepts, I can help you with:\n\n• Current lesson: "${currentLesson?.title || 'Introduction to C'}"\n• Basic C programming concepts\n• Code syntax and examples\n• General programming questions\n\nCould you rephrase your question or ask about something specific in C programming?`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Chat cleared! I'm here to help you with ${courseTitle || 'C programming'}. Currently studying: "${currentLesson?.title || 'Introduction to C'}". What would you like to learn?`,
        timestamp: new Date()
      }
    ]);
  };

  if (!isExpanded) {
    return (
      <div className="chatbot-toggle">
        <button 
          className="chatbot-toggle-btn"
          onClick={onToggle}
          aria-label="Open chat assistant"
        >
          <MessageCircle size={20} />
          <span className="notification-dot"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      {/* Chat Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="bot-avatar">
            <Bot size={18} />
          </div>
          <div className="bot-info">
            <h3>Learning Assistant</h3>
            <span className="bot-status">
              <span className="status-dot"></span>
              Online
            </span>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <button 
            className="header-action-btn"
            onClick={clearChat}
            title="Clear chat"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="header-action-btn"
            onClick={onToggle}
            title="Minimize chat"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-avatar">
              {message.type === 'user' ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <pre className="message-text">{message.content}</pre>
              </div>
              <div className="message-timestamp">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot-message">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="message-bubble typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("Explain the current lesson")}
          >
            📖 Explain current lesson
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("Show me a code example")}
          >
            💻 Show code example
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => setInputMessage("What are the key concepts?")}
          >
            🔑 Key concepts
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about C programming..."
            className="message-input"
            rows={1}
            maxLength={500}
          />
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="input-footer">
          <span className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
