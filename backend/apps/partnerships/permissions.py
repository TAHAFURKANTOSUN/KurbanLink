from rest_framework import permissions


class IsBuyer(permissions.BasePermission):
    """
    Permission to check if user has BUYER role
    """
    message = "Bu işlem için alıcı rolüne sahip olmalısınız."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.user_roles.filter(
                   role__code='BUYER',
                   is_active=True
               ).exists()


class IsCreator(permissions.BasePermission):
    """
    Permission to check if user is the creator of the partnership
    """
    message = "Bu işlemi sadece ilan sahibi yapabilir."
    
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user
