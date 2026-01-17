import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchButcherAppointments, approveAppointment, rejectAppointment } from '../../api/butchers';
import './Butcher.css';

const ButcherAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    const loadAppointments = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchButcherAppointments();
            setAppointments(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error('Failed to load appointments:', err);
            setError('Randevular yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await approveAppointment(id);
            await loadAppointments();
        } catch (err) {
            console.error('Approve failed:', err);
            alert('Onaylama başarısız: ' + (err.response?.data?.detail || 'Bilinmeyen hata'));
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Bu randevuyu reddetmek istediğinize emin misiniz?')) {
            return;
        }

        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await rejectAppointment(id);
            await loadAppointments();
        } catch (err) {
            console.error('Reject failed:', err);
            alert('Reddetme başarısız: ' + (err.response?.data?.detail || 'Bilinmeyen hata'));
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // Group appointments by status
    const groupedAppointments = {
        PENDING: appointments.filter(a => a.status === 'PENDING'),
        APPROVED: appointments.filter(a => a.status === 'APPROVED'),
        REJECTED: appointments.filter(a => a.status === 'REJECTED'),
        CANCELLED: appointments.filter(a => a.status === 'CANCELLED')
    };

    if (loading) {
        return (
            <div className="butcher-container">
                <div className="butcher-header">
                    <h1>Randevularım</h1>
                </div>
                <div className="page">
                    <div className="page__container">
                        <div className="loading">Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="butcher-container">
                <div className="butcher-header">
                    <h1>Randevularım</h1>
                </div>
                <div className="page">
                    <div className="page__container">
                        <div className="form-card">
                            <p className="error-message">{error}</p>
                            <button onClick={loadAppointments} className="retry-btn">Tekrar Dene</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="butcher-container">
            <div className="butcher-header">
                <h1>Randevularım</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/butcher/profile')} className="nav-btn">
                        Profil
                    </button>
                    <button onClick={() => navigate('/')} className="back-btn">← Geri</button>
                </div>
            </div>

            <div className="page">
                <div className="page__container appointments-container">
                    {appointments.length === 0 ? (
                        <div className="form-card">
                            <p className="empty-message">Henüz randevu yok.</p>
                        </div>
                    ) : (
                        <div className="appointments-sections">
                            {/* Pending Appointments */}
                            {groupedAppointments.PENDING.length > 0 && (
                                <div className="appointments-section">
                                    <h2>Bekleyen Randevular</h2>
                                    <div className="appointments-list">
                                        {groupedAppointments.PENDING.map(apt => (
                                            <div key={apt.id} className="appointment-card pending">
                                                <div className="appointment-info">
                                                    <p><strong>Tarih:</strong> {apt.date}</p>
                                                    <p><strong>Saat:</strong> {apt.time}</p>
                                                    <p><strong>Müşteri:</strong> {apt.customer_email || apt.customer}</p>
                                                    {apt.animal_count && <p><strong>Hayvan Sayısı:</strong> {apt.animal_count}</p>}
                                                    {apt.notes && <p><strong>Not:</strong> {apt.notes}</p>}
                                                </div>
                                                <div className="appointment-actions">
                                                    <button
                                                        onClick={() => handleApprove(apt.id)}
                                                        className="approve-btn"
                                                        disabled={actionLoading[apt.id]}
                                                    >
                                                        {actionLoading[apt.id] ? 'İşleniyor...' : 'Onayla'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(apt.id)}
                                                        className="reject-btn"
                                                        disabled={actionLoading[apt.id]}
                                                    >
                                                        {actionLoading[apt.id] ? 'İşleniyor...' : 'Reddet'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Approved Appointments */}
                            {groupedAppointments.APPROVED.length > 0 && (
                                <div className="appointments-section">
                                    <h2>Onaylanan Randevular</h2>
                                    <div className="appointments-list">
                                        {groupedAppointments.APPROVED.map(apt => (
                                            <div key={apt.id} className="appointment-card approved">
                                                <div className="appointment-info">
                                                    <p><strong>Tarih:</strong> {apt.date}</p>
                                                    <p><strong>Saat:</strong> {apt.time}</p>
                                                    <p><strong>Müşteri:</strong> {apt.customer_email || apt.customer}</p>
                                                    {apt.animal_count && <p><strong>Hayvan Sayısı:</strong> {apt.animal_count}</p>}
                                                </div>
                                                <div className="status-badge approved">Onaylandı</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejected Appointments */}
                            {groupedAppointments.REJECTED.length > 0 && (
                                <div className="appointments-section">
                                    <h2>Reddedilen Randevular</h2>
                                    <div className="appointments-list">
                                        {groupedAppointments.REJECTED.map(apt => (
                                            <div key={apt.id} className="appointment-card rejected">
                                                <div className="appointment-info">
                                                    <p><strong>Tarih:</strong> {apt.date}</p>
                                                    <p><strong>Saat:</strong> {apt.time}</p>
                                                    <p><strong>Müşteri:</strong> {apt.customer_email || apt.customer}</p>
                                                </div>
                                                <div className="status-badge rejected">Reddedildi</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cancelled Appointments */}
                            {groupedAppointments.CANCELLED.length > 0 && (
                                <div className="appointments-section">
                                    <h2>İptal Edilen Randevular</h2>
                                    <div className="appointments-list">
                                        {groupedAppointments.CANCELLED.map(apt => (
                                            <div key={apt.id} className="appointment-card cancelled">
                                                <div className="appointment-info">
                                                    <p><strong>Tarih:</strong> {apt.date}</p>
                                                    <p><strong>Saat:</strong> {apt.time}</p>
                                                    <p><strong>Müşteri:</strong> {apt.customer_email || apt.customer}</p>
                                                </div>
                                                <div className="status-badge cancelled">İptal Edildi</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ButcherAppointments;
