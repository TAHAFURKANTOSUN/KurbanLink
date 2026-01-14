"""
Butchers app configuration.
"""

from django.apps import AppConfig


class ButchersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.butchers'
    verbose_name = 'Butchers'
    
    def ready(self):
        """Import signal handlers when app is ready."""
        import apps.butchers.signals
