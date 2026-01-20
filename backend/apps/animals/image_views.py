"""
Views for animal images.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsOwner
from .models import AnimalListing, AnimalImage
from .image_serializers import AnimalImageSerializer


from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

class AnimalImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for animal listing images.
    
    Permissions:
        - list/retrieve: IsAuthenticated
        - create/destroy: IsOwner (via listing)
    """
    serializer_class = AnimalImageSerializer
    queryset = AnimalImage.objects.all()
    
    def get_permissions(self):
        """Owner can manage images of their listings."""
        if self.action in ['create', 'destroy']:
            permission_classes = [IsAuthenticated, IsOwner]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Return images for the listing specified in URL.
        
        Returns:
            QuerySet of images for the listing
        """
        listing_id = self.kwargs.get('listing_pk')
        if listing_id:
            return AnimalImage.objects.filter(listing_id=listing_id).select_related('listing')
        return AnimalImage.objects.select_related('listing')
    
    def create(self, request, *args, **kwargs):
        """
        Upload image to listing.
        
        Returns:
            201 Created if successful
            403 Forbidden if not the seller
        """
        try:
            listing_id = self.kwargs.get('listing_pk')
            listing = get_object_or_404(AnimalListing, pk=listing_id)
            
            # Check ownership via IsSellerAndOwner permission
            self.check_object_permissions(request, listing)
            
            # Create serializer with listing
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(listing=listing)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Image upload failed: {str(e)}", exc_info=True)
            return Response(
                {'detail': f"Upload failed: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(methods=['post'], detail=False, url_path='reorder')
    def reorder(self, request, *args, **kwargs):
        """
        Bulk update image order.
        
        Expected payload:
            {
                "orders": [
                    {"id": 10, "order": 0},
                    {"id": 11, "order": 1},
                    ...
                ]
            }
        
        Returns:
            200 OK with updated images list
            403 Forbidden if not the seller
        """
        listing_id = self.kwargs.get('listing_pk')
        listing = get_object_or_404(AnimalListing, pk=listing_id)
        
        # Check ownership
        if listing.seller != request.user:
            return Response(
                {'detail': 'You do not have permission to reorder these images.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        orders = request.data.get('orders', [])
        
        # Update each image's order
        for item in orders:
            image_id = item.get('id')
            new_order = item.get('order')
            
            try:
                image = AnimalImage.objects.get(id=image_id, listing=listing)
                image.order = new_order
                image.save()
            except AnimalImage.DoesNotExist:
                continue
        
        # Return updated images
        images = AnimalImage.objects.filter(listing=listing)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete image.
        
        Returns:
            204 No Content if successful
            403 Forbidden if not the seller
        """
        instance = self.get_object()
        
        # Check if user is the seller of the listing
        if instance.listing.seller != request.user:
            return Response(
                {'detail': 'You do not have permission to delete this image.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete the file and database record
        instance.image.delete(save=False)
        instance.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
