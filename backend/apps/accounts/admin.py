"""
Admin configuration for accounts app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, UserRole


class UserRoleInline(admin.TabularInline):
    """Inline for managing user roles within User admin."""
    model = UserRole
    extra = 1
    fields = ['role', 'is_active', 'assigned_at']
    readonly_fields = ['assigned_at']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for custom User model."""
    list_display = ['email', 'username', 'phone_number', 'country_code', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'country_code']
    search_fields = ['email', 'username', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'phone_number', 'country_code')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'phone_number', 'country_code', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']
    inlines = [UserRoleInline]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Admin interface for Role model.
    """
    
    list_display = ('code', 'name', 'created_at')
    search_fields = ('code', 'name')
    ordering = ('code',)
    readonly_fields = ('created_at',)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """
    Admin interface for UserRole model.
    """
    
    list_display = ('user', 'role', 'is_active', 'assigned_at')
    list_filter = ('is_active', 'role')
    search_fields = ('user__email', 'role__code')
    ordering = ('-assigned_at',)
    readonly_fields = ('assigned_at',)
    autocomplete_fields = ['user', 'role']
