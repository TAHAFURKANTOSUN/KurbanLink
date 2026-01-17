import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications } from '../api/notifications';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadNotifications();

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotifications(sorted);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            loadNotifications(); // Refresh when opening
        }
    };

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <button className="notification-bell" onClick={toggleDropdown}>
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <span>Bildirimler</span>
                        <button onClick={() => { navigate('/notifications'); setIsOpen(false); }}>
                            Tümünü Gör
                        </button>
                    </div>
                    <div className="dropdown-list">
                        {notifications.length === 0 ? (
                            <div className="dropdown-empty">Bildirim yok</div>
                        ) : (
                            notifications.slice(0, 5).map(notification => (
                                <div
                                    key={notification.id}
                                    className={`dropdown-item ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                                >
                                    <div className="dropdown-message">{notification.message}</div>
                                    <div className="dropdown-time">
                                        {new Date(notification.created_at).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
