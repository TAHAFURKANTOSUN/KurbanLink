"""
Email OTP utility functions for verification flow.
"""

import random
import secrets
from datetime import timedelta
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import EmailOTPVerification, EmailVerificationToken, User


def generate_otp() -> str:
    """Generate a 6-digit OTP code."""
    return str(random.randint(0, 999999)).zfill(6)


def hash_otp(otp: str) -> str:
    """Hash an OTP using Django's password hasher."""
    return make_password(otp)


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Verify an OTP against its hash."""
    return check_password(plain_otp, hashed_otp)


def send_otp_email(email: str, otp: str):
    """Send OTP to user's email."""
    subject = 'KurbanLink doğrulama kodunuz'
    message = f"""
Merhaba,

KurbanLink hesabınızı doğrulamak için aşağıdaki kodu kullanın:

Doğrulama Kodu: {otp}

Bu kod 10 dakika boyunca geçerlidir.

Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı göz ardı edin.

İyi günler,
KurbanLink Ekibi
    """
    
    send_mail(
        subject,
        message.strip(),
        settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@kurbanlink.com',
        [email],
        fail_silently=False,
    )


def create_otp_verification(email: str, user=None) -> tuple[EmailOTPVerification, str]:
    """
    Create a new OTP verification record.
    
    Returns tuple of (verification_record, plain_otp)
    """
    # Invalidate any existing active OTPs for this email
    EmailOTPVerification.objects.filter(
        email=email,
        purpose='REGISTER_EMAIL_VERIFY',
        consumed_at__isnull=True,
        expires_at__gt=timezone.now()
    ).update(consumed_at=timezone.now())
    
    # Generate and hash OTP
    plain_otp = generate_otp()
    otp_hash = hash_otp(plain_otp)
    
    # Create verification record
    verification = EmailOTPVerification.objects.create(
        email=email,
        user=user,
        otp_hash=otp_hash,
        expires_at=timezone.now() + timedelta(minutes=10),
        last_sent_at=timezone.now(),
        purpose='REGISTER_EMAIL_VERIFY'
    )
    
    return verification, plain_otp


def can_resend_otp(email: str, purpose: str = 'REGISTER_EMAIL_VERIFY') -> tuple[bool, str]:
    """
    Check if user can request a new OTP.
    
    Returns tuple of (can_resend: bool, error_message: str)
    """
    latest_otp = EmailOTPVerification.objects.filter(
        email=email,
        purpose=purpose
    ).order_by('-created_at').first()
    
    if not latest_otp:
        return True, ""
    
    # Check cooldown (60 seconds)
    if latest_otp.last_sent_at:
        cooldown_seconds = 60
        time_since_last = (timezone.now() - latest_otp.last_sent_at).total_seconds()
        if time_since_last < cooldown_seconds:
            remaining = int(cooldown_seconds - time_since_last)
            return False, f"{remaining} saniye sonra tekrar deneyebilirsiniz."
    
    return True, ""


def get_active_verification(email: str, purpose:str = 'REGISTER_EMAIL_VERIFY'):
    """Get active (not consumed, not expired) OTP verification for email."""
    return EmailOTPVerification.objects.filter(
        email=email,
        purpose=purpose,
        consumed_at__isnull=True,
        expires_at__gt=timezone.now()
    ).order_by('-created_at').first()


def is_email_verified(email: str) -> bool:
    """Check if email has been verified (either via OTP or existing user)."""
    # Check if user exists with this email and is verified
    user = User.objects.filter(email=email).first()
    if user and user.email_verified:
        return True
    
    # Check if there's a consumed verification
    consumed_verification = EmailOTPVerification.objects.filter(
        email=email,
        purpose='REGISTER_EMAIL_VERIFY',
        consumed_at__isnull=False
    ).exists()
    
    return consumed_verification
