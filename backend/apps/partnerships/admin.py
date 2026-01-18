from django.contrib import admin
from .models import PartnershipListing


@admin.register(PartnershipListing)
class PartnershipListingAdmin(admin.ModelAdmin):
    list_display = ['id', 'city', 'person_count', 'creator', 'animal', 'status', 'created_at']
    list_filter = ['status', 'city', 'created_at']
    search_fields = ['city', 'creator__email', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('creator', 'city', 'person_count', 'description')
        }),
        ('Association', {
            'fields': ('animal',)
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
