import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchButcherAppointments, approveAppointment, rejectAppointment } from '../../api/butchers';
import './ButcherAppointments.css';

const ButcherAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchButcherAppointments();
            setAppointments(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error('Failed to load appointments:', err);
            setError('Randevular yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: 'approve' }));
        try {
            await approveAppointment(id);
            await loadAppointments();
        } catch (err) {
            console.error('Approve failed:', err);
            alert('Onaylama başarısız: ' + (err.response?.data?.detail || 'Bilinmeyen hata'));
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Bu randevuyu reddetmek istediğinize emin misiniz?')) {
            return;
        }

        setActionLoading(prev => ({ ...prev, [id]: 'reject' }));
        try {
            await rejectAppointment(id);
            await loadAppointments();
        } catch (err) {
            console.error('Reject failed:', err);
            alert('Reddetme başarısız: ' + (err.response?.data?.detail || 'Bilinmeyen hata'));
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: null }));
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        return timeStr.substring(0, 5);
    };

    // Group appointments by status
    const pending = appointments.filter(a => a.status === 'PENDING');
    const approved = appointments.filter(a => a.status === 'APPROVED');
    const rejected = appointments.filter(a => a.status === 'REJECTED');
    const cancelled = appointments.filter(a => a.status === 'CANCELLED');

    // Group approved by date
    const approvedByDate = approved.reduce((acc, apt) => {
        if (!acc[apt.date]) acc[apt.date] = [];
        acc[apt.date].push(apt);
        return acc;
    }, {});

    const renderAppointmentCard = (apt, showActions = false) => (
        <div key={apt.id} className="appointment-card">
            <div className="card-header">
                <div className="date-time">
                    <span className="date">📅 {formatDate(apt.date)}</span>
                    <span className="time">🕐 {formatTime(apt.time)}</span>
                </div>
                <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                    {apt.status === 'PENDING' ? 'Beklemede' :
                        apt.status === 'APPROVED' ? 'Onaylandı' :
                            apt.status === 'REJECTED' ? 'Reddedildi' :
                                'İptal Edildi'}
                </span>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span className="label">Müşteri:</span>
                    <span className="value">{apt.customer_email || apt.customer || 'Bilinmiyor'}</span>
                </div>
                {apt.notes && (
                    <div className="info-row">
                        <span className="label">Not:</span>
                        <span className="value">{apt.notes}</span>
                    </div>
                )}
            </div>

            {showActions && (
                <div className="card-actions">
                    <button
                        onClick={() => handleApprove(apt.id)}
                        className="btn-approve"
                        disabled={actionLoading[apt.id]}
                    >
                        {actionLoading[apt.id] === 'approve' ? 'Onaylanıyor...' : 'Onayla'}
                    </button>
                    <button
                        onClick={() => handleReject(apt.id)}
                        className="btn-reject"
                        disabled={actionLoading[apt.id]}
                    >
                        {actionLoading[apt.id] === 'reject' ? 'Reddediliyor...' : 'Reddet'}
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="butcher-appointments-page">
                <Navbar />
                <div className="container">
                    <div className="loading-state">Randevular yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="butcher-appointments-page">
                <Navbar />
                <div className="container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={loadAppointments} className="btn-primary">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="butcher-appointments-page">
            <Navbar />

            <div className="container appointments-content">
                <div className="page-header">
                    <h1>Randevularım</h1>
                    <p className="subtitle">Randevu taleplerinizi yönetin</p>
                </div>

                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Henüz randevu talebi bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="appointments-sections">
                        {/* Pending Section */}
                        {pending.length > 0 && (
                            <section className="appointments-section">
                                <h2 className="section-title">
                                    <span className="title-badge pending-badge">{pending.length}</span>
                                    Bekleyen Talepler
                                </h2>
                                <div className="appointments-grid">
                                    {pending.map(apt => renderAppointmentCard(apt, true))}
                                </div>
                            </section>
                        )}

                        {/* Approved Section */}
                        {approved.length > 0 && (
                            <section className="appointments-section">
                                <h2 className="section-title">
                                    <span className="title-badge approved-badge">{approved.length}</span>
                                    Onaylanmış Randevular
                                </h2>
                                {Object.entries(approvedByDate)
                                    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                                    .map(([date, apts]) => (
                                        <div key={date} className="date-group">
                                            <h3 className="date-header">{formatDate(date)}</h3>
                                            <div className="appointments-grid">
                                                {apts.map(apt => renderAppointmentCard(apt, false))}
                                            </div>
                                        </div>
                                    ))}
                            </section>
                        )}

                        {/* Rejected/Cancelled Section */}
                        {(rejected.length > 0 || cancelled.length > 0) && (
                            <section className="appointments-section">
                                <h2 className="section-title">
                                    <span className="title-badge rejected-badge">
                                        {rejected.length + cancelled.length}
                                    </span>
                                    Reddedilen / İptal Edilen
                                </h2>
                                <div className="appointments-grid">
                                    {[...rejected, ...cancelled].map(apt => renderAppointmentCard(apt, false))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ButcherAppointments;
