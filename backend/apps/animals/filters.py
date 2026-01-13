"""
Filters for animals app.
"""

import django_filters
from .models import AnimalListing


class AnimalListingFilter(django_filters.FilterSet):
    """
    FilterSet for AnimalListing model.
    
    Provides filtering by:
    - animal_type (exact match)
    - price range (min_price, max_price)
    - location (case-insensitive partial match)
    - age range (min_age, max_age)
    - weight range (min_weight, max_weight)
    """
    
    animal_type = django_filters.ChoiceFilter(
        field_name='animal_type',
        choices=AnimalListing.ANIMAL_TYPE_CHOICES,
        help_text="Filter by animal type (SMALL or LARGE)"
    )
    
    min_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte',
        help_text="Minimum price"
    )
    max_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte',
        help_text="Maximum price"
    )
    
    location = django_filters.CharFilter(
        field_name='location',
        lookup_expr='icontains',
        help_text="Filter by location (partial match, case-insensitive)"
    )
    
    min_age = django_filters.NumberFilter(
        field_name='age',
        lookup_expr='gte',
        help_text="Minimum age in months"
    )
    max_age = django_filters.NumberFilter(
        field_name='age',
        lookup_expr='lte',
        help_text="Maximum age in months"
    )
    
    min_weight = django_filters.NumberFilter(
        field_name='weight',
        lookup_expr='gte',
        help_text="Minimum weight in kg"
    )
    max_weight = django_filters.NumberFilter(
        field_name='weight',
        lookup_expr='lte',
        help_text="Maximum weight in kg"
    )
    
    class Meta:
        model = AnimalListing
        fields = [
            'animal_type',
            'min_price',
            'max_price',
            'location',
            'min_age',
            'max_age',
            'min_weight',
            'max_weight'
        ]
