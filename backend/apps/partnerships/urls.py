from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartnershipListingViewSet

router = DefaultRouter()
router.register(r'', PartnershipListingViewSet, basename='partnership')

urlpatterns = [
    path('', include(router.urls)),
]
