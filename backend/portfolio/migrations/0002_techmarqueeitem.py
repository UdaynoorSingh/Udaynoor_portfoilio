from django.db import migrations, models


def seed_tech_marquee(apps, schema_editor):
    TechMarqueeItem = apps.get_model("portfolio", "TechMarqueeItem")
    row1_labels = [
        "REACT NATIVE",
        "NODE.JS",
        "THREE.JS",
        "FRAMER MOTION",
        "TAILWIND CSS",
        "MONGODB",
        "EXPRESS",
    ]
    row2_labels = [
        "C++",
        "JAVASCRIPT",
        "TYPESCRIPT",
        "GSAP",
        "WEBGL",
        "NEXT.JS",
        "POSTGRESQL",
    ]
    for i, label in enumerate(row1_labels):
        TechMarqueeItem.objects.create(row=1, label=label, sort_order=i, published=True)
    for i, label in enumerate(row2_labels):
        TechMarqueeItem.objects.create(row=2, label=label, sort_order=i, published=True)


def unseed_tech_marquee(apps, schema_editor):
    TechMarqueeItem = apps.get_model("portfolio", "TechMarqueeItem")
    TechMarqueeItem.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TechMarqueeItem",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "row",
                    models.PositiveSmallIntegerField(
                        choices=[(1, "Row 1 (forward)"), (2, "Row 2 (reverse)")],
                        db_index=True,
                    ),
                ),
                (
                    "label",
                    models.CharField(
                        help_text="Display text, e.g. REACT or NODE.JS",
                        max_length=120,
                    ),
                ),
                (
                    "sort_order",
                    models.PositiveIntegerField(
                        db_index=True,
                        default=0,
                        help_text="Lower numbers appear first within the row.",
                    ),
                ),
                ("published", models.BooleanField(db_index=True, default=True)),
            ],
            options={
                "verbose_name": "Tech marquee item",
                "verbose_name_plural": "Tech marquee items",
                "ordering": ["row", "sort_order", "id"],
            },
        ),
        migrations.RunPython(seed_tech_marquee, unseed_tech_marquee),
    ]
