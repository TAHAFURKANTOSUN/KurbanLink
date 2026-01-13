"""
Pagination classes for animals app.
"""

from rest_framework.pagination import PageNumberPagination


class AnimalListingPagination(PageNumberPagination):
    """
    Pagination for animal listings.
    
    - Default page size: 10
    - Client can override with ?page_size= (max 50)
    - Standard pagination response with count, next, previous, results
    """
    
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
