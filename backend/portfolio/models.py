from django.db import models


class Project(models.Model):
    """Portfolio project card — synced to the React Projects section via JSON API."""

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, help_text="Unique key for admin / future detail URLs.")
    description = models.TextField()
    tech_stack = models.JSONField(
        default=list,
        help_text='List of strings, e.g. ["React", "Django"]. Matches frontend `tech` array.',
    )
    status = models.CharField(max_length=64, default="Live")
    link = models.URLField(blank=True, default="", help_text="Project URL (use # if none).")
    color = models.CharField(
        max_length=120,
        default="var(--color-accent)",
        help_text="CSS color token or hex, e.g. var(--color-accent) or #d4a843",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Lower numbers appear first.",
    )
    published = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-updated_at"]

    def __str__(self) -> str:
        return self.title


class TechMarqueeItem(models.Model):
    """Ordered labels for the tech marquee (two rows). Editable in admin, exposed via /api/tech-marquee/."""

    ROW_ONE = 1
    ROW_TWO = 2
    ROW_CHOICES = [
        (ROW_ONE, "Row 1 (forward)"),
        (ROW_TWO, "Row 2 (reverse)"),
    ]

    row = models.PositiveSmallIntegerField(choices=ROW_CHOICES, db_index=True)
    label = models.CharField(max_length=120, help_text="Display text, e.g. REACT or NODE.JS")
    sort_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Lower numbers appear first within the row.",
    )
    published = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["row", "sort_order", "id"]
        verbose_name = "Tech marquee item"
        verbose_name_plural = "Tech marquee items"

    def __str__(self) -> str:
        return f"Row {self.row} · {self.label}"


class ContactMessage(models.Model):
    """Inbound messages from the site contact form (visible in admin)."""

    name = models.CharField(max_length=120)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    read = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"
