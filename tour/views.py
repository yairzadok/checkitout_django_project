from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return render(request, 'tour/home.html')

def start_tour(request):
    return HttpResponse("<h1>הסיור התחיל!</h1>")


def tour(request):
    return render(request, "tour/tour.html")
