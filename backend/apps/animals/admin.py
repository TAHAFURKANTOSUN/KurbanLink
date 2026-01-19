"""
Admin configuration for animals app.
"""

from django.contrib import admin
from .models import AnimalListing, AnimalImage


@admin.register(AnimalListing)
class AnimalListingAdmin(admin.ModelAdmin):
    """Admin for animal listings with comprehensive column display."""
    list_display = [
        'id',
        'seller_username',
        'contact_info',
        'description_short',
        'species',
        'breed',
        'gender',
        'age_months',
        'weight',
        'price',
        'ear_tag_no',
        'city_district',
        'company',
        'created_at',
        'is_active',
    ]
    list_filter = ['species', 'gender', 'is_active', 'city', 'created_at']
    search_fields = ['seller__username', 'seller__email', 'breed', 'ear_tag_no', 'city', 'district']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'animal_type']
    
    def seller_username(self, obj):
        """İlan Veren username."""
        return obj.seller.username if obj.seller else '-'
    seller_username.short_description = 'İlan Veren'
    
    def contact_info(self, obj):
        """İletişim (phone + email)."""
        if obj.seller:
            return f"{obj.seller.phone_number} / {obj.seller.email}"
        return '-'
    contact_info.short_description = 'İletişim'
    
    def description_short(self, obj):
        """Açıklama (first 50 chars)."""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = 'Açıklama'
    
    def city_district(self, obj):
        """Şehir / İlçe combined."""
        if obj.city and obj.district:
            return f"{obj.city} / {obj.district}"
        elif obj.location:
            return obj.location
        return '-'
    city_district.short_description = 'Şehir / İlçe'
    
    fieldsets = (
        ('Animal Information', {
            'fields': ('animal_type', 'breed', 'age', 'weight')
        }),
        ('Listing Details', {
            'fields': ('seller', 'price', 'location', 'description')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at')
        }),
    )


@admin.register(AnimalImage)
class AnimalImageAdmin(admin.ModelAdmin):
    """
    Admin interface for AnimalImage model.
    """
    
    list_display = ('listing', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('listing__breed', 'listing__location')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
