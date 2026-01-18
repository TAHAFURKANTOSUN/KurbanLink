from rest_framework import serializers
from .models import PartnershipListing


class PartnershipListingSerializer(serializers.ModelSerializer):
    creator_email = serializers.EmailField(source='creator.email', read_only=True)
    animal_details = serializers.SerializerMethodField()
    
    class Meta:
        model = PartnershipListing
        fields = [
            'id', 'creator', 'creator_email', 'animal', 'animal_details',
            'city', 'person_count', 'description', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at', 'status']
    
    def get_animal_details(self, obj):
        """Return basic animal info if animal is associated"""
        if obj.animal and obj.animal.is_active:
            return {
                'id': obj.animal.id,
                'animal_type': obj.animal.animal_type,
                'breed': obj.animal.breed,
                'price': str(obj.animal.price),
                'location': obj.animal.location,
                'is_active': obj.animal.is_active
            }
        return None
    
    def validate_person_count(self, value):
        """Ensure person_count is at least 1"""
        if value < 1:
            raise serializers.ValidationError("Ortak sayısı en az 1 olmalıdır.")
        return value
    
    def validate_city(self, value):
        """Ensure city is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Şehir alanı zorunludur.")
        return value.strip()
