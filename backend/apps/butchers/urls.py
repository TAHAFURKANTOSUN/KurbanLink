"""
URL configuration for butchers app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ButcherProfileViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r'profiles', ButcherProfileViewSet, basename='butcher-profile')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = router.urls
