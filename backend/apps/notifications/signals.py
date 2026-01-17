"""
Signal handlers for automatic notification creation.
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.messages.models import Message
from apps.favorites.models import Favorite
from apps.animals.models import AnimalListing
from .models import Notification


@receiver(post_save, sender=Message)
def notify_on_new_message(sender, instance, created, **kwargs):
    """
    Create notification when a new message is sent.
    
    Notifies the OTHER participant (not the sender).
    """
    if not created:
        return
    
    conversation = instance.conversation
    
    # Determine receiver (the other participant)
    if instance.sender == conversation.buyer:
        receiver = conversation.seller
    else:
        receiver = conversation.buyer
    
    Notification.objects.create(
        user=receiver,
        type=Notification.NEW_MESSAGE,
        title='Yeni Mesaj',
        message=f'{conversation.listing.breed} hakkında yeni mesajınız var',
        data={
            'conversation_id': conversation.id,
            'listing_id': conversation.listing.id,
        }
    )


@receiver(post_save, sender=Favorite)
def notify_on_favorite(sender, instance, created, **kwargs):
    """
    Create notification when a listing is favorited.
    
    Notifies the seller who owns the listing.
    """
    if not created:
        return
    
    seller = instance.animal.seller
    
    Notification.objects.create(
        user=seller,
        type=Notification.FAVORITED_LISTING,
        title='İlan Favorilendi',
        message=f'{instance.user.email} {instance.animal.breed} ilanınızı favorilere ekledi',
        data={
            'listing_id': instance.animal.id,
        }
    )


# Store old price temporarily
_listing_old_prices = {}


@receiver(pre_save, sender=AnimalListing)
def track_listing_changes(sender, instance, **kwargs):
    """
    Track changes before saving to detect price changes.
    """
    if instance.pk:
        try:
            old_instance = AnimalListing.objects.get(pk=instance.pk)
            _listing_old_prices[instance.pk] = old_instance.price
        except AnimalListing.DoesNotExist:
            pass


@receiver(post_save, sender=AnimalListing)
def notify_on_listing_update(sender, instance, created, **kwargs):
    """
    Create notifications when a listing is updated.
    
    Notifies users who have favorited this listing.
    Checks for price changes specifically.
    """
    if created:
        return
    
    # Get users who favorited this listing
    favorited_by = instance.favorited_by.select_related('user').values_list('user', flat=True)
    
    if not favorited_by:
        # Clean up tracking
        _listing_old_prices.pop(instance.pk, None)
        return
    
    # Check if price changed
    old_price = _listing_old_prices.get(instance.pk)
    
    if old_price is not None and old_price != instance.price:
        # Create price change notifications
        notifications = [
            Notification(
                user_id=user_id,
                type=Notification.PRICE_CHANGED,
                title='Fiyat Değişti',
                message=f'{instance.breed} için fiyat {old_price} → {instance.price} olarak değişti',
                data={
                    'listing_id': instance.id,
                    'old_price': str(old_price),
                    'new_price': str(instance.price),
                }
            )
            for user_id in favorited_by
        ]
    else:
        # General listing update
        notifications = [
            Notification(
                user_id=user_id,
                type=Notification.LISTING_UPDATED,
                title='İlan Güncellendi',
                message=f'Favorilediğiniz ilan ({instance.breed}) güncellendi',
                data={
                    'listing_id': instance.id,
                }
            )
            for user_id in favorited_by
        ]
    
    Notification.objects.bulk_create(notifications)
    
    # Clean up tracking
    _listing_old_prices.pop(instance.pk, None)
