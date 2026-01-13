"""
Models for favorites app.
"""

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Favorite(models.Model):
    """
    Represents a user's favorite animal listing.
    
    Users can favorite animal listings to save them for later viewing.
    A user cannot favorite the same animal more than once, and cannot
    favorite their own listings.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
        help_text="User who favorited the listing"
    )
    animal = models.ForeignKey(
        'animals.AnimalListing',
        on_delete=models.CASCADE,
        related_name='favorited_by',
        help_text="The animal listing that was favorited"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'favorite'
        verbose_name_plural = 'favorites'
        unique_together = [['user', 'animal']]
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.user.email} - {self.animal.breed}"
    
    def clean(self) -> None:
        """
        Validate that user is not favoriting their own listing.
        
        Raises:
            ValidationError: If user tries to favorite their own listing
        """
        super().clean()
        
        if self.animal.seller == self.user:
            raise ValidationError("You cannot favorite your own listing.")
