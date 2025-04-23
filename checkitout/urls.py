from tour.views import tour
from django.urls import path, include

urlpatterns = [
    path("tour", tour, name="tour"),
    path('', include('tour.urls')),
]
