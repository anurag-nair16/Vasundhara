# Generated migration for adding AI classification fields to WasteReport

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_wastereport"),
    ]

    operations = [
        migrations.AddField(
            model_name='wastereport',
            name='category',
            field=models.CharField(
                blank=True,
                null=True,
                max_length=50,
                choices=[
                    ('garbage', 'Garbage'),
                    ('road', 'Road'),
                    ('fire', 'Fire'),
                    ('water', 'Water'),
                    ('construction', 'Construction'),
                    ('air', 'Air Pollution'),
                ]
            ),
        ),
        migrations.AddField(
            model_name='wastereport',
            name='severity',
            field=models.CharField(
                blank=True,
                null=True,
                max_length=20,
                choices=[
                    ('low', 'Low'),
                    ('medium', 'Medium'),
                    ('high', 'High'),
                ]
            ),
        ),
        migrations.AddField(
            model_name='wastereport',
            name='response_time',
            field=models.CharField(blank=True, null=True, max_length=255),
        ),
    ]
