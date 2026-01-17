import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchConversationMessages, markAllRead, sendMessage } from '../../api/messages';
import './Messages.css';

const ConversationDetail = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadMessages();
        // Mark all as read on enter
        markAllRead(conversationId).catch(console.error);
    }, [conversationId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConversationMessages(conversationId);
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages:', err);
            setError('Mesajlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        setSending(true);

        try {
            await sendMessage(conversationId, newMessage);
            setNewMessage('');
            // Reload messages
            await loadMessages();
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Mesaj gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="loading">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="form-card">
                        <p className="error-message">{error}</p>
                        <button onClick={loadMessages} className="submit-btn">Tekrar Dene</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page__container messages-container">
                <div className="messages-header">
                    <h1>Konuşma</h1>
                    <button onClick={() => navigate('/messages')} className="back-btn">← Mesajlar</button>
                </div>

                <div className="messages-thread">
                    {messages.length === 0 ? (
                        <p className="empty-message">Henüz mesaj yok. İlk mesajı gönderin!</p>
                    ) : (
                        messages.map(message => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === user.id ? 'message-sent' : 'message-received'}`}
                            >
                                <div className="message-content">{message.content}</div>
                                <div className="message-timestamp">
                                    {new Date(message.created_at).toLocaleString('tr-TR')}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="message-form">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesaj gönderin..."
                        disabled={sending}
                    />
                    <button type="submit" disabled={sending || !newMessage.trim()}>
                        {sending ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConversationDetail;
