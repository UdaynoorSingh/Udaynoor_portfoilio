from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

from portfolio import views
from portfolio_site.settings import FRONTEND_DIST

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("portfolio.urls")),
]

if FRONTEND_DIST.is_dir():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        urlpatterns += [
            re_path(
                r"^assets/(?P<path>.*)$",
                serve,
                {"document_root": assets_dir},
            ),
        ]
    tex_dir = FRONTEND_DIST / "textures"
    if tex_dir.is_dir():
        urlpatterns += [
            re_path(
                r"^textures/(?P<path>.*)$",
                serve,
                {"document_root": tex_dir},
            ),
        ]
    audio_dir = FRONTEND_DIST / "audio"
    if audio_dir.is_dir():
        urlpatterns += [
            re_path(
                r"^audio/(?P<path>.*)$",
                serve,
                {"document_root": audio_dir},
            ),
        ]
    urlpatterns += [
        path("vite.svg", serve, {"path": "vite.svg", "document_root": str(FRONTEND_DIST)}),
    ]

urlpatterns += [
    path("", views.spa_index, name="spa-index"),
]
