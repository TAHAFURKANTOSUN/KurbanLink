"""
Models for notifications app.
"""

from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Represents an in-app notification for a user.
    
    Notifications are immutable (except is_read status).
    """
    
    # Notification types
    NEW_MESSAGE = 'NEW_MESSAGE'
    FAVORITED_LISTING = 'FAVORITED_LISTING'
    LISTING_UPDATED = 'LISTING_UPDATED'
    PRICE_CHANGED = 'PRICE_CHANGED'
    APPOINTMENT_REQUESTED = 'APPOINTMENT_REQUESTED'
    APPOINTMENT_APPROVED = 'APPOINTMENT_APPROVED'
    APPOINTMENT_REJECTED = 'APPOINTMENT_REJECTED'
    APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED'
    
    TYPE_CHOICES = [
        (NEW_MESSAGE, 'New Message'),
        (FAVORITED_LISTING, 'Favorited Listing'),
        (LISTING_UPDATED, 'Listing Updated'),
        (PRICE_CHANGED, 'Price Changed'),
        (APPOINTMENT_REQUESTED, 'Appointment Requested'),
        (APPOINTMENT_APPROVED, 'Appointment Approved'),
        (APPOINTMENT_REJECTED, 'Appointment Rejected'),
        (APPOINTMENT_CANCELLED, 'Appointment Cancelled'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User who receives this notification"
    )
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        help_text="Type of notification"
    )
    title = models.CharField(
        max_length=255,
        help_text="Notification title"
    )
    message = models.TextField(
        help_text="Notification message content"
    )
    data = models.JSONField(
        null=True,
        blank=True,
        help_text="Contextual data (listing_id, conversation_id, etc.)"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the notification has been read"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'notification'
        verbose_name_plural = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self) -> str:
        status = "Read" if self.is_read else "Unread"
        return f"[{status}] {self.type} for {self.user.email}"
    
    def mark_as_read(self) -> None:
        """
        Mark this notification as read.
        
        Idempotent operation.
        """
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])
