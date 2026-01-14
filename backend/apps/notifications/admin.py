"""
Admin configuration for notifications app.
"""

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin interface for Notification model.
    """
    
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('user', 'type', 'title', 'message', 'data', 'created_at')
    
    def has_add_permission(self, request):
        """Disable manual creation in admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable deletion in admin."""
        return False
