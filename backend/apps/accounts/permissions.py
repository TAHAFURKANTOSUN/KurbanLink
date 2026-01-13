"""
Custom permission classes for role-based access control.

These permissions check user roles from the JWT access token payload,
not from the database or Django's built-in permission system.
"""

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from typing import Any


class IsSeller(BasePermission):
    """
    Permission class that allows access only to users with the SELLER role.
    
    This permission checks the 'roles' field in the JWT access token payload.
    If the user is not authenticated or does not have the SELLER role,
    access is denied with a 403 Forbidden response.
    
    Usage:
        permission_classes = [IsAuthenticated, IsSeller]
    """
    
    def has_permission(self, request: Request, view: Any) -> bool:
        """
        Check if the user has the SELLER role in their JWT token.
        
        Args:
            request: The request object containing authentication data
            view: The view being accessed
            
        Returns:
            True if user is authenticated and has SELLER role, False otherwise
        """
        # Deny access if user is not authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get roles from JWT token payload
        # request.auth contains the validated token payload when using JWT
        if not request.auth:
            return False
        
        roles = request.auth.get('roles', [])
        
        # Check if SELLER role is present
        return 'SELLER' in roles


class IsButcher(BasePermission):
    """
    Permission class that allows access only to users with the BUTCHER role.
    
    This permission checks the 'roles' field in the JWT access token payload.
    If the user is not authenticated or does not have the BUTCHER role,
    access is denied with a 403 Forbidden response.
    
    Usage:
        permission_classes = [IsAuthenticated, IsButcher]
    """
    
    def has_permission(self, request: Request, view: Any) -> bool:
        """
        Check if the user has the BUTCHER role in their JWT token.
        
        Args:
            request: The request object containing authentication data
            view: The view being accessed
            
        Returns:
            True if user is authenticated and has BUTCHER role, False otherwise
        """
        # Deny access if user is not authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get roles from JWT token payload
        # request.auth contains the validated token payload when using JWT
        if not request.auth:
            return False
        
        roles = request.auth.get('roles', [])
        
        # Check if BUTCHER role is present
        return 'BUTCHER' in roles


class IsSellerAndOwner(BasePermission):
    """
    Permission class that allows access only to sellers who own the object.
    
    This permission combines two checks:
    1. User must have the SELLER role in their JWT token
    2. User must be the owner of the object (object.seller == request.user)
    
    Used for update and delete operations on seller-owned resources.
    
    Usage:
        permission_classes = [IsAuthenticated, IsSellerAndOwner]
    """
    
    def has_permission(self, request: Request, view: Any) -> bool:
        """
        Check if the user has the SELLER role.
        
        Args:
            request: The request object containing authentication data
            view: The view being accessed
            
        Returns:
            True if user is authenticated and has SELLER role, False otherwise
        """
        # Deny access if user is not authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get roles from JWT token payload
        if not request.auth:
            return False
        
        roles = request.auth.get('roles', [])
        
        # Check if SELLER role is present
        return 'SELLER' in roles
    
    def has_object_permission(self, request: Request, view: Any, obj: Any) -> bool:
        """
        Check if the user is the owner of the object.
        
        Args:
            request: The request object containing authentication data
            view: The view being accessed
            obj: The object being accessed (must have a 'seller' attribute)
            
        Returns:
            True if the object's seller is the requesting user, False otherwise
        """
        # Check if user is the owner (seller)
        return obj.seller == request.user
