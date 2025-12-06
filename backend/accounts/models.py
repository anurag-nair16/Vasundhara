from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('citizen', 'Citizen'),
        ('agent', 'Field Agent'),
        ('supervisor', 'Supervisor'),
        ('admin', 'Admin'),
        ('system', 'System / Bot'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Project-specific attributes
    eco_score = models.IntegerField(default=0)
    civic_score = models.IntegerField(default=0)
    carbon_credits = models.FloatField(default=0)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')

    # Engagement metrics
    issues_reported = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)

    # Badges
    badge = models.CharField(max_length=50, default="Bronze")

    # Basic profile details
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"

class ModelOutput(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='model_outputs')
    resolution_time = models.CharField(max_length=100)
    department_allocated = models.CharField(max_length=255)
    severity = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)  # auto timestamp

    def __str__(self):
        return f"{self.user.username} - {self.severity}"

class WasteReport(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('invalid', 'Invalid'),
    )

    CATEGORY_CHOICES = (
        ('garbage', 'Garbage'),
        ('road', 'Road'),
        ('fire', 'Fire'),
        ('water', 'Water'),
        ('construction', 'Construction'),
        ('air', 'Air Pollution'),
    )

    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waste_reports')
    description = models.TextField()
    issue_type = models.CharField(max_length=100, default='General Waste Issue')
    location = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    photo = models.ImageField(upload_to='waste_reports/', blank=True, null=True)
    voice_note = models.FileField(upload_to='voice_notes/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # AI Classification fields
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True, null=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, blank=True, null=True)
    response_time = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.issue_type} - {self.status}"
    
class CivicIssue(models.Model):
    issue = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue} - {self.name}"