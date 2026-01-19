import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Phone, CheckCheck, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Message {
  type: 'sent' | 'received';
  message: string;
  time: string;
  media_url?: string | null;
}

interface Contact {
  phone: string;
  last_activity: string;
  unread: number;
}

interface ChatData {
  phone: string;
  order_id: string;
  messages: Message[];
}

export default function WhatsAppChat() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      loadMessages(selectedPhone);
    }
  }, [selectedPhone]);

  useEffect(() => {
    scrollToBottom();
  }, [chatData?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContacts = async () => {
    try {
      const response = await fetch('/admin/whatsapp/phone-numbers', {
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const loadMessages = async (phone: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/admin/whatsapp/messages/${phone}`, {
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setChatData(data);
      setContacts(prev => prev.map(c => 
        c.phone === phone ? { ...c, unread: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedPhone || sending) return;

    setSending(true);
    
    // Use Inertia router for CSRF-protected requests
    router.post('/admin/whatsapp/send', 
      {
        phone: selectedPhone,
        message: messageInput
      },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          // Add message to UI immediately
          if (chatData) {
            setChatData({
              ...chatData,
              messages: [...chatData.messages, {
                type: 'sent',
                message: messageInput,
                time: new Date().toISOString(),
                media_url: null
              }]
            });
          }
          setMessageInput('');
          setSending(false);
        },
        onError: (errors) => {
          console.error('Failed to send message:', errors);
          alert('Failed to send message');
          setSending(false);
        }
      }
    );
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (time: string) => {
    const date = new Date(time);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.phone.includes(searchQuery)
  );

  const renderMedia = (mediaUrl: string) => {
    const ext = mediaUrl.split('.').pop()?.toLowerCase();
    const url = `/storage/whatsapp/${mediaUrl}`;

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <img src={url} alt="Media" className="max-w-xs rounded-lg" />;
    } else if (['ogg', 'mp3', 'wav'].includes(ext || '')) {
      return (
        <audio controls className="max-w-xs">
          <source src={url} type={`audio/${ext}`} />
        </audio>
      );
    } else {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          Download File
        </a>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="bg-[#008069] text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">WhatsApp Chat</h1>
          <MoreVertical className="w-6 h-6 cursor-pointer" />
        </div>

        {/* Search */}
        <div className="p-3 bg-gray-50 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069]"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.phone}
              onClick={() => setSelectedPhone(contact.phone)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                selectedPhone === contact.phone ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#008069] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 truncate">
                      {contact.phone}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(contact.last_activity)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate">
                      Last: {formatDate(contact.last_activity)}
                    </p>
                    {contact.unread > 0 && (
                      <span className="bg-[#25D366] text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedPhone ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-100 p-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#008069] flex items-center justify-center text-white">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selectedPhone}</p>
                <p className="text-sm text-gray-500">Order ID: {chatData?.order_id}</p>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4"
              style={{ 
                background: '#efeae2',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M10 10h10v10H10z' fill='%23ffffff' opacity='0.05'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3C/svg%3E")`
              }}
            >
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-[#008069] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {chatData?.messages.map((msg, idx) => {
                    const showDate = idx === 0 || 
                      formatDate(msg.time) !== formatDate(chatData.messages[idx - 1].time);

                    return (
                      <React.Fragment key={idx}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-white px-3 py-1 rounded-lg text-xs text-gray-600 shadow">
                              {formatDate(msg.time)}
                            </span>
                          </div>
                        )}
                        <div className={`flex mb-2 ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-md rounded-lg px-4 py-2 ${
                              msg.type === 'sent'
                                ? 'bg-[#d9fdd3]'
                                : 'bg-white'
                            } shadow-sm`}
                          >
                            {msg.media_url && renderMedia(msg.media_url)}
                            {msg.message && (
                              <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(msg.time)}
                              </span>
                              {msg.type === 'sent' && (
                                <CheckCheck className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-gray-100 p-4 border-t">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-200 rounded-full transition">
                  <Smile className="w-6 h-6 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition">
                  <Paperclip className="w-6 h-6 text-gray-600" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#008069] disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="p-3 bg-[#008069] text-white rounded-full hover:bg-[#007055] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ background: '#efeae2' }}>
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 text-gray-300">
                <svg viewBox="0 0 303 303" fill="currentColor">
                  <path d="M151.5 0C67.9 0 0 67.9 0 151.5S67.9 303 151.5 303 303 235.1 303 151.5 235.1 0 151.5 0zm0 280.5c-71.1 0-129-57.9-129-129s57.9-129 129-129 129 57.9 129 129-57.9 129-129 129z"/>
                  <path d="M151.5 40.5c-61.2 0-111 49.8-111 111s49.8 111 111 111 111-49.8 111-111-49.8-111-111-111zm55.3 146.7l-25.5 25.5c-3 3-7.8 3-10.8 0l-38.1-38.1c-3-3-3-7.8 0-10.8l25.5-25.5c3-3 7.8-3 10.8 0l38.1 38.1c3 3 3 7.8 0 10.8z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-light text-gray-600 mb-2">
                WhatsApp Business
              </h2>
              <p className="text-gray-500">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}