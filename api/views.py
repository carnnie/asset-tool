from django.shortcuts import render




import logging



logger = logging.getLogger("main")


# Create your views here.

   
def test_view(request):
    return render(request, 'printers.html', {})