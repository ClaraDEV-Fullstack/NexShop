from rest_framework.pagination import PageNumberPagination


class FlexiblePageNumberPagination(PageNumberPagination):
    """Standard pagination that also lets callers request a larger page via ?page_size=N (max 100)."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100
