from django.urls import path

from . import views

urlpatterns = [
    path("bootstrap/", views.bootstrap_csrf, name="api-bootstrap-csrf"),
    path("projects/", views.projects_list, name="api-projects"),
    path("contact/", views.contact_submit, name="api-contact"),
]
