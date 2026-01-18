from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PartnershipListing
from .serializers import PartnershipListingSerializer
from .permissions import IsBuyer, IsCreator


class PartnershipListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for partnership listings
    - List: all open partnerships (filterable by city)
    - Create: create new partnership (BUYER only)
    - Retrieve: get single partnership
    - Update: update partnership (creator only)
    - Close: close partnership (creator only)
    """
    serializer_class = PartnershipListingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on query params"""
        queryset = PartnershipListing.objects.filter(status='OPEN')
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by has_animal
        has_animal = self.request.query_params.get('has_animal')
        if has_animal == 'true':
            queryset = queryset.filter(animal__isnull=False)
        elif has_animal == 'false':
            queryset = queryset.filter(animal__isnull=True)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create']:
            return [IsAuthenticated(), IsBuyer()]
        if self.action in ['update', 'partial_update', 'destroy', 'close']:
            return [IsAuthenticated(), IsBuyer(), IsCreator()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set creator to current user"""
        serializer.save(creator=self.request.user)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a partnership listing"""
        partnership = self.get_object()
        partnership.status = 'CLOSED'
        partnership.save()
        serializer = self.get_serializer(partnership)
        return Response(serializer.data)
