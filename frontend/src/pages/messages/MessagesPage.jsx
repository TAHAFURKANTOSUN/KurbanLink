import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchConversations, fetchConversationMessages, sendMessage, markAllRead } from '../../api/messages';
import { Send } from '../../ui/icons';
import './MessagesPage.css';

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle conversation ID from URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(conversationId));
      if (conv) {
        handleConversationSelect(conv);
      }
    }
  }, [searchParams, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    setLoading(true);
    try {
      const data = await fetchConversationMessages(conversationId);
      setMessages(data);

      // Mark as read
      await markAllRead(conversationId);

      // Update local unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ conversation: conversation.id });
    loadMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const newMessage = await sendMessage(selectedConversation.id, messageInput.trim());
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');

      // Update last message in conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, last_message: newMessage }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const getCounterpartyName = (conversation) => {
    return user.id === conversation.buyer
      ? conversation.seller_username
      : conversation.buyer_username;
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}dk`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}s`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="messages-page">
      < div className="messages-container" >
        {/* Left Column - Conversation List */}
        < div className="messages-sidebar" >
          <div className="messages-sidebar__header">
            <h2>Mesajlar</h2>
          </div>
          <div className="messages-sidebar__list">
            {loading && conversations.length === 0 ? (
              <div className="messages-sidebar__loading">Yükleniyor...</div>
            ) : conversations.length === 0 ? (
              <div className="messages-sidebar__empty">Henüz mesajınız yok</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`messages-sidebar__item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                  onClick={() => handleConversationSelect(conv)}
                >
                  <div className="messages-sidebar__avatar">
                    {getCounterpartyName(conv)?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="messages-sidebar__content">
                    <div className="messages-sidebar__header-row">
                      <span className="messages-sidebar__name">
                        {getCounterpartyName(conv)}
                      </span>
                      {conv.last_message && (
                        <span className="messages-sidebar__time">
                          {formatTime(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <div className="messages-sidebar__preview">
                        {conv.last_message.content}
                      </div>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="messages-sidebar__unread">{conv.unread_count}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div >

        {/* Right Column - Thread View */}
        < div className="messages-main" >
          {!selectedConversation ? (
            <div className="messages-main__empty">
              <h3>Bir konuşma seçin</h3>
              <p>Mesajlaşmaya başlamak için sol taraftan bir konuşma seçin</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="messages-main__header">
                <div className="messages-main__header-avatar">
                  {getCounterpartyName(selectedConversation)?.charAt(0)?.toUpperCase()}
                </div>
                <h3>{getCounterpartyName(selectedConversation)}</h3>
              </div>

              {/* Messages */}
              <div className="messages-main__body">
                {loading && messages.length === 0 ? (
                  <div className="messages-main__loading">Yükleniyor...</div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === user.id ? 'mine' : 'theirs'}`}
                    >
                      <div className="message__bubble">
                        {msg.content}
                      </div>
                      <div className="message__time">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="messages-main__footer" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={!messageInput.trim() || sending}>
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </div >
      </div >
    </div >
  );
};

export default MessagesPage;
