"""
Views for animals app.
"""

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.permissions import IsSeller, IsSellerAndOwner
from .models import AnimalListing
from .serializers import AnimalListingSerializer


class AnimalListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for animal listings.
    
    - CREATE: Only sellers can create listings
    - LIST: Any authenticated user can view active listings
    - UPDATE: Only the seller who owns the listing can update it
    - DELETE: Only the seller who owns the listing can delete it (soft delete)
    """
    
    serializer_class = AnimalListingSerializer
    queryset = AnimalListing.objects.filter(is_active=True)
    
    def get_permissions(self):
        """
        Set different permissions for different actions.
        
        - create: Requires IsSeller
        - update/partial_update/destroy: Requires IsSellerAndOwner
        - list/retrieve: Requires IsAuthenticated only
        """
        if self.action == 'create':
            permission_classes = [IsAuthenticated, IsSeller]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsSellerAndOwner]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Override to allow sellers to see all their listings (including inactive)
        when updating/deleting, but only active listings for list view.
        """
        if self.action in ['update', 'partial_update', 'destroy', 'retrieve']:
            # For update/delete/retrieve, show all listings (including inactive)
            # Permission check will ensure only owner can access
            return AnimalListing.objects.all()
        
        # For list, only show active listings
        return AnimalListing.objects.filter(is_active=True)
    
    def perform_create(self, serializer) -> None:
        """
        Automatically set the seller to the authenticated user.
        
        Args:
            serializer: The validated serializer instance
        """
        serializer.save(seller=self.request.user)
    
    def perform_destroy(self, instance) -> None:
        """
        Soft delete: set is_active to False instead of deleting the record.
        
        Args:
            instance: The AnimalListing instance to soft delete
        """
        instance.is_active = False
        instance.save()
    
    def create(self, request, *args, **kwargs):
        """
        Create a new animal listing.
        
        Returns:
            201 Created if successful
            403 Forbidden if user is not a seller
        """
        return super().create(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """
        List all active animal listings.
        
        Returns:
            200 OK with list of active listings
        """
        return super().list(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update an animal listing (PUT).
        
        Returns:
            200 OK if successful
            403 Forbidden if user is not the seller or doesn't have SELLER role
            404 Not Found if listing doesn't exist
        """
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update an animal listing (PATCH).
        
        Returns:
            200 OK if successful
            403 Forbidden if user is not the seller or doesn't have SELLER role
            404 Not Found if listing doesn't exist
        """
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete an animal listing (sets is_active=False).
        
        Returns:
            204 No Content if successful
            403 Forbidden if user is not the seller or doesn't have SELLER role
            404 Not Found if listing doesn't exist
        """
        return super().destroy(request, *args, **kwargs)
