class MeSerializer(serializers.ModelSerializer):
    """
    Serializer for current user identity.
    Returns id, email, username, phone, country, city, district, profile image, and active roles.
    """
    roles = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone_number', 'country_code', 'city', 'district', 'profile_image_url', 'roles']
        read_only_fields = ['id', 'email', 'roles']
    
    def get_roles(self, obj):
        """Extract role codes from active UserRole relationships"""
        return [ur.role.code for ur in obj.user_roles.filter(is_active=True)]
    
    def get_profile_image_url(self, obj):
        """Return full URL for profile image if exists."""
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None
