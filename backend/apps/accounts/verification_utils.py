"""
Verification token utilities for secure registration flow.
"""

import secrets
from datetime import timedelta
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from .models import EmailVerificationToken


def generate_verification_token() -> str:
    """Generate a cryptographically secure verification token."""
    return secrets.token_urlsafe(32)


def create_verification_token(email: str) -> tuple[str, EmailVerificationToken]:
    """
    Create a verification token for the given email.
    
    Returns tuple of (plain_token, token_record)
    """
    # Invalidate any existing active tokens for this email
    EmailVerificationToken.objects.filter(
        email=email,
        purpose='REGISTER_EMAIL',
        consumed_at__isnull=True,
        expires_at__gt=timezone.now()
    ).update(consumed_at=timezone.now())
    
    # Generate new token
    plain_token = generate_verification_token()
    token_hash = make_password(plain_token)
    
    # Create token record
    token_record = EmailVerificationToken.objects.create(
        email=email,
        token_hash=token_hash,
        expires_at=timezone.now() + timedelta(minutes=30),
        purpose='REGISTER_EMAIL'
    )
    
    return plain_token, token_record


def validate_verification_token(email: str, plain_token: str) -> tuple[bool, str]:
    """
    Validate a verification token for registration.
    
    Returns tuple of (is_valid: bool, error_message: str)
    """
    # Find active token for this email
    token = EmailVerificationToken.objects.filter(
        email=email,
        purpose='REGISTER_EMAIL',
        consumed_at__isnull=True,
        expires_at__gt=timezone.now()
    ).order_by('-created_at').first()
    
    if not token:
        return False, "E-posta doğrulanmadan kayıt tamamlanamaz."
    
    # Verify token
    if not check_password(plain_token, token.token_hash):
        return False, "Geçersiz doğrulama token'ı."
    
    return True, ""


def consume_verification_token(email: str, plain_token: str) -> bool:
    """
    Consume (mark as used) a verification token.
    
    Returns True if successfully consumed, False otherwise.
    """
    token = EmailVerificationToken.objects.filter(
        email=email,
        purpose='REGISTER_EMAIL',
        consumed_at__isnull=True,
        expires_at__gt=timezone.now()
    ).order_by('-created_at').first()
    
    if not token:
        return False
    
    if check_password(plain_token, token.token_hash):
        token.consumed_at = timezone.now()
        token.save()
        return True
    
    return False
