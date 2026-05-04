from django.contrib import admin

from .models import ContactMessage, Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "sort_order", "published", "updated_at")
    list_filter = ("published", "status")
    search_fields = ("title", "slug", "description")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("sort_order", "-updated_at")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "read", "created_at")
    list_filter = ("read",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)
