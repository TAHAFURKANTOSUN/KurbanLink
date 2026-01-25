"""
Custom User model for KurbanLink.

Uses email authentication instead of username.
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication.
    """
    
    def create_user(self, email: str, password: str = None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email: str, password: str = None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email-based authentication.
    
    Email is used instead of username for authentication.
    """
    
    
    email = models.EmailField(unique=True)
    username = models.CharField(
        max_length=30,
        unique=True,
        null=True,
        blank=True,
        help_text="Unique username (lowercase, alphanumeric + underscore)"
    )
    phone_number = models.CharField(
        max_length=32,
        blank=True,
        default="",
        help_text="Contact phone number (free-form)"
    )
    country_code = models.CharField(
        max_length=8,
        default="TR",
        help_text="Country code for location context (e.g., TR, DE)"
    )

    # Personal information
    first_name = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text="User's first name"
    )
    last_name = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text="User's last name"
    )
    
    # Email verification
    email_verified = models.BooleanField(
        default=False,
        help_text="Whether the user's email has been verified"
    )
    
    # Profile fields for UX revamp
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    city = models.CharField(max_length=100, blank=True, default='')
    district = models.CharField(max_length=100, blank=True, default='')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self) -> str:
        return self.email


class EmailOTPVerification(models.Model):
    """
    Stores email OTP verification data for registration flow.
    
    OTPs are stored as hashed values and expire after 10 minutes.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True, help_text="Email address to verify")
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Associated user (null if not yet registered)"
    )
    otp_hash = models.CharField(
        max_length=128,
        help_text="Hashed OTP code (never store plaintext)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text="OTP expiration time")
    consumed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the OTP was successfully verified"
    )
    attempt_count = models.IntegerField(
        default=0,
        help_text="Number of failed verification attempts"
    )
    resend_count = models.IntegerField(
        default=0,
        help_text="Number of times OTP was resent"
    )
    last_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When OTP was last sent"
    )
    purpose = models.CharField(
        max_length=50,
        default='REGISTER_EMAIL_VERIFY',
        help_text="Purpose of this OTP"
    )
    
    class Meta:
        verbose_name = 'Email OTP Verification'
        verbose_name_plural = 'Email OTP Verifications'
        indexes = [
            models.Index(fields=['email', 'purpose', 'consumed_at']),
            models.Index(fields=['email', 'purpose', 'expires_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"OTP for {self.email} ({'consumed' if self.consumed_at else 'pending'})"
    
    def is_expired(self) -> bool:
        """Check if OTP has expired."""
        return timezone.now() > self.expires_at
    
    def is_consumed(self) -> bool:
        """Check if OTP has been consumed."""
        return self.consumed_at is not None
    
    def is_locked(self) -> bool:
        """Check if too many attempts have been made."""
        return self.attempt_count >= 5


class EmailVerificationToken(models.Model):
    """
    Stores verification tokens issued after successful OTP verification.
    
    Tokens are single-use and expire after 30 minutes.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True, help_text="Verified email address")
    token_hash = models.CharField(
        max_length=128,
        help_text="Hashed verification token (never store plaintext)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text="Token expiration time")
    consumed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the token was used for registration"
    )
    purpose = models.CharField(
        max_length=50,
        default='REGISTER_EMAIL',
        help_text="Purpose of this verification token"
    )
    
    class Meta:
        verbose_name = 'Email Verification Token'
        verbose_name_plural = 'Email Verification Tokens'
        indexes = [
            models.Index(fields=['email', 'purpose', 'consumed_at']),
            models.Index(fields=['email', 'purpose', 'expires_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"Verification token for {self.email} ({'consumed' if self.consumed_at else 'active'})"
    
    def is_expired(self) -> bool:
        """Check if token has expired."""
        return timezone.now() > self.expires_at
    
    def is_consumed(self) -> bool:
        """Check if token has been consumed."""
        return self.consumed_at is not None
    
    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not consumed)."""
        return not self.is_expired() and not self.is_consumed()


class Role(models.Model):
    """
    Represents a system-wide role that can be assigned to users.
    
    Roles define different user types in the system (e.g., BUYER, SELLER, BUTCHER).
    This model is designed to be extendable with additional metadata in the future.
    """
    
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique role identifier (uppercase, e.g., BUYER, SELLER, BUTCHER)"
    )
    name = models.CharField(
        max_length=100,
        help_text="Human-readable role name"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'role'
        verbose_name_plural = 'roles'
        ordering = ['code']
    
    def __str__(self) -> str:
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure role code is always uppercase.
        """
        self.code = self.code.upper()
        super().save(*args, **kwargs)


class UserRole(models.Model):
    """
    Represents the assignment of a role to a user.
    
    This model creates a many-to-many relationship between Users and Roles,
    with additional metadata such as assignment date and active status.
    A user can have multiple roles, but the same role cannot be assigned twice.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles',
        help_text="User to whom the role is assigned"
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='user_assignments',
        help_text="Role assigned to the user"
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this role assignment is currently active"
    )
    
    class Meta:
        verbose_name = 'user role'
        verbose_name_plural = 'user roles'
        unique_together = [['user', 'role']]
        ordering = ['-assigned_at']
    
    def __str__(self) -> str:
        return f"{self.user.email} - {self.role.code}"
