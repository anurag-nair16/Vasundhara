from django.contrib import admin
from .models import UserProfile, ModelOutput
from .models import WasteReport
from .models import CivicIssue

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'eco_score', 'badge', 'carbon_credits')
    search_fields = ('user__username', 'role')

@admin.register(ModelOutput)
class ModelOutputAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'severity', 'department_allocated', 'resolution_time', 'created_at')
    list_filter = ('severity', 'department_allocated', 'created_at')
    search_fields = ('user__username', 'severity', 'department_allocated')


@admin.register(WasteReport)
class WasteReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'issue_type', 'location', 'created_at', 'category', 'severity')
    list_filter = ('issue_type', 'status', 'category', 'severity', 'created_at')
    search_fields = ('user__username', 'description', 'location')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('user', 'description', 'issue_type', 'status')
        }),
        ('Location & Media', {
            'fields': ('location', 'latitude', 'longitude', 'photo', 'voice_note')
        }),
        ('AI Classification', {
            'fields': ('category', 'severity', 'response_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(CivicIssue)
class CivicIssueAdmin(admin.ModelAdmin):
    list_display = ("id", "issue", "name", "phone", "address", "created_at")
    search_fields = ("issue", "name", "phone", "address")
    list_filter = ("issue", "created_at")