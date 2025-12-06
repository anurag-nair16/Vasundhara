from rest_framework import serializers
from .models import UserProfile, ModelOutput, WasteReport, CivicIssue
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = UserProfile
        fields = "__all__"

class ModelOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelOutput
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class WasteReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = WasteReport
        fields = ['id', 'username', 'description', 'issue_type', 'location', 'latitude', 
                  'longitude', 'photo', 'voice_note', 'status', 'category', 'severity', 
                  'response_time', 'created_at', 'updated_at']
        read_only_fields = ('user', 'created_at', 'updated_at', 'status', 'category', 
                           'severity', 'response_time')

class CivicIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CivicIssue
        fields = ['id', 'issue', 'description', 'name', 'phone', 'address', 'created_at']
        read_only_fields = ('created_at',)
