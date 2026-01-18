from django.db import models
from django.conf import settings
from apps.animals.models import AnimalListing


class PartnershipListing(models.Model):
    """
    Partnership listing for buyers seeking kurban partners
    """
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    ]
    
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='partnerships',
        help_text="The buyer who created this partnership listing"
    )
    animal = models.ForeignKey(
        AnimalListing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='partnerships',
        help_text="Optional: associated animal listing"
    )
    city = models.CharField(
        max_length=100,
        help_text="City where partnership is sought"
    )
    person_count = models.PositiveIntegerField(
        help_text="Number of partners needed"
    )
    description = models.TextField(
        blank=True,
        help_text="Optional description or notes"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='OPEN'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Partnership Listing"
        verbose_name_plural = "Partnership Listings"
    
    def __str__(self):
        return f"{self.city} - {self.person_count} kişi (by {self.creator.email})"
