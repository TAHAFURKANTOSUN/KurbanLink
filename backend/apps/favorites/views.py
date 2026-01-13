"""
Views for favorites app.
"""

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user favorites.
    
    - CREATE: Add animal to favorites
    - LIST: Get user's favorites
    - DESTROY: Remove from favorites
    - UPDATE: Not allowed
    """
    
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']  # Disable PUT/PATCH
    
    def get_queryset(self):
        """
        Return only favorites belonging to the authenticated user.
        
        Returns:
            QuerySet of the user's favorites
        """
        return Favorite.objects.filter(user=self.request.user).select_related('animal', 'user')
    
    def perform_create(self, serializer) -> None:
        """
        Automatically set the user to the authenticated user.
        
        Args:
            serializer: The validated serializer instance
        """
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """
        Add an animal listing to favorites.
        
        Returns:
            201 Created if successful
            400 Bad Request if already favorited or invalid
            403 Forbidden if trying to favorite own listing
        """
        return super().create(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """
        List all favorites for the authenticated user.
        
        Returns:
            200 OK with list of favorites
        """
        return super().list(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Remove an animal from favorites.
        
        Only the owner of the favorite can delete it.
        
        Returns:
            204 No Content if successful
            403 Forbidden if not the owner
            404 Not Found if favorite doesn't exist
        """
        # The queryset is already filtered by user, so this ensures ownership
        return super().destroy(request, *args, **kwargs)
