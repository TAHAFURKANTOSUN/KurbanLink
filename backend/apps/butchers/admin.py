"""
Admin configuration for butchers app.
"""

from django.contrib import admin
from .models import ButcherProfile, Appointment


@admin.register(ButcherProfile)
class ButcherProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for ButcherProfile model.
    """
    
    list_display = ('business_name', 'user', 'city', 'rating', 'is_active', 'created_at')
    list_filter = ('is_active', 'city', 'created_at')
    search_fields = ('business_name', 'user__email', 'city')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """
    Admin interface for Appointment model.
    """
    
    list_display = ('butcher', 'user', 'date', 'time', 'status', 'created_at')
    list_filter = ('status', 'date', 'created_at')
    search_fields = ('butcher__business_name', 'user__email', 'note')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
