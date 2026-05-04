import json

from django.http import FileResponse, Http404, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from portfolio_site.settings import FRONTEND_DIST

from .models import ContactMessage, Project


@ensure_csrf_cookie
@require_GET
def bootstrap_csrf(request):
    """Lightweight GET so the SPA can obtain a csrftoken cookie (e.g. via Vite dev proxy)."""
    return JsonResponse({"ok": True})


@ensure_csrf_cookie
@require_http_methods(["GET", "HEAD"])
def spa_index(request):
    """
    Serve the Vite production index.html from ../dist (run `npm run build` from repo root).
    CSRF cookie is set so POST /api/contact/ works from the SPA on the same origin.
    """
    index_path = FRONTEND_DIST / "index.html"
    if not index_path.is_file():
        raise Http404(
            "dist/index.html not found. From repo root run: npm run build"
        )
    return FileResponse(index_path.open("rb"), content_type="text/html; charset=utf-8")


@require_GET
def projects_list(request):
    """Trimmed field query for the projects grid — single round-trip, indexed ordering."""
    qs = (
        Project.objects.filter(published=True)
        .order_by("sort_order", "-updated_at")
        .only(
            "title",
            "description",
            "tech_stack",
            "status",
            "link",
            "color",
        )
    )
    data = [
        {
            "title": p.title,
            "description": p.description,
            "tech": p.tech_stack or [],
            "status": p.status,
            "link": p.link or "#",
            "color": p.color or "var(--color-accent)",
        }
        for p in qs
    ]
    return JsonResponse({"results": data})


@require_POST
def contact_submit(request):
    """
    Accept JSON POST from the contact form.
    Expects header X-CSRFToken on cross-origin-safe same-site POSTs.
    """
    try:
        body = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "invalid_json"}, status=400)

    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    message = (body.get("message") or "").strip()

    if not name or not email or not message:
        return JsonResponse({"ok": False, "error": "missing_fields"}, status=400)

    ContactMessage.objects.create(name=name, email=email, message=message)
    return JsonResponse({"ok": True})
