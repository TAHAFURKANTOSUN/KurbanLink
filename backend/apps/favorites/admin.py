"""
Admin configuration for favorites app.
"""

from django.contrib import admin
from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    """
    Admin interface for Favorite model.
    """
    
    list_display = ('user', 'animal', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'animal__breed', 'animal__location')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Favorite Information', {
            'fields': ('user', 'animal')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
