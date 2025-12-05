from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class SignupView(APIView):
    def post(self, request):
        data = request.data
        try:
            # Get username from either 'username' or 'name' field
            username = data.get("username") or data.get("name")
            if not username:
                return Response({"error": "username or name is required"}, status=400)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return Response({"error": "Username already exists"}, status=400)
            
            email = data.get("email", "")
            if not email:
                return Response({"error": "email is required"}, status=400)
            
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email already registered"}, status=400)
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=data.get("password")
            )

            # profile auto-created via signal
            profile = user.userprofile

            # optional initial values
            profile.role = data.get("role", "citizen")
            profile.phone = data.get("phone", "")
            profile.save()

            return Response({
                "message": "User created successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(APIView):
    def post(self, request):
        from django.contrib.auth import authenticate

        # Get credentials - accept username, name, or email
        username_or_email = request.data.get("username") or request.data.get("name") or request.data.get("email")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Username/email and password are required"}, status=400)

        # First try direct authentication with username
        user = authenticate(username=username_or_email, password=password)
        
        # If that fails and it looks like an email, try to find user by email first
        if user is None and "@" in username_or_email:
            try:
                user_by_email = User.objects.get(email=username_or_email)
                user = authenticate(username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })

from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.userprofile
            return Response({
                "user": request.user.username,
                "name": request.user.first_name or request.user.username,
                "email": request.user.email,
                "role": profile.role,
                "eco_score": profile.eco_score,
                "civic_score": profile.civic_score,
                "carbon_credits": profile.carbon_credits,
                "issues_reported": profile.issues_reported,
                "tasks_completed": profile.tasks_completed,
                "badge": profile.badge,
                "phone": profile.phone,
                "address": profile.address
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ModelOutput
from .serializers import ModelOutputSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_image(request):

    # 1️⃣ Read uploaded image
    image = request.FILES.get('image')
    if not image:
        return Response({"error": "Image is required"}, status=400)

    # 2️⃣ Your ML model logic here — mock output:
    output = {
        "resolution_time": "2 days",
        "department_allocated": "Road Maintenance",
        "severity": "High"
    }

    # 3️⃣ Save output in database
    model_output = ModelOutput.objects.create(
        user=request.user,
        resolution_time=output["resolution_time"],
        department_allocated=output["department_allocated"],
        severity=output["severity"]
    )

    # 4️⃣ Return saved record
    serializer = ModelOutputSerializer(model_output)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# Waste Report Endpoints
from rest_framework import viewsets
from .models import WasteReport
from .serializers import WasteReportSerializer

class WasteReportViewSet(viewsets.ModelViewSet):
    serializer_class = WasteReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own reports, admin can see all
        if self.request.user.is_staff:
            return WasteReport.objects.all()
        return WasteReport.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Auto-assign the report to the current user
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_waste_report(request):
    """Create a new waste report with AI classification"""
    try:
        import requests
        
        # Parse location data if provided
        location_data = request.data.get('location', {})
        if isinstance(location_data, str):
            import json
            try:
                location_data = json.loads(location_data)
            except:
                location_data = {}
        
        latitude = location_data.get('lat') if isinstance(location_data, dict) else None
        longitude = location_data.get('lon') if isinstance(location_data, dict) else None
        location_address = location_data.get('address') if isinstance(location_data, dict) else location_data

        # Create waste report (initially without classification)
        waste_report = WasteReport.objects.create(
            user=request.user,
            description=request.data.get('description'),
            issue_type=request.data.get('issue_type', 'General Waste Issue'),
            location=location_address,
            latitude=latitude,
            longitude=longitude,
            status='pending'
        )

        # Handle photo upload
        if 'photo' in request.FILES:
            print(f"Photo received: {request.FILES['photo'].name}")
            waste_report.photo = request.FILES['photo']
            waste_report.save()
            print(f"Photo saved to: {waste_report.photo.path}")
            
            # Send image and description to environment_classifier for validation
            try:
                # Environment classifier server (use local testing port 8002)
                validator_url = "http://localhost:8002/validate"
                print(f"Calling validator at: {validator_url}")
                with open(waste_report.photo.path, 'rb') as img_file:
                    files = {'image': img_file}
                    data = {'description': request.data.get('description', '')}
                    validator_response = requests.post(validator_url, files=files, data=data, timeout=60)
                
                print(f"Validator response status: {validator_response.status_code}")
                print(f"Validator response: {validator_response.text}")
                
                if validator_response.status_code == 200:
                    validation_data = validator_response.json()
                    print(f"Validation data: {validation_data}")
                    
                    if validation_data.get('is_valid', False):
                        # Valid report - save classification results
                        waste_report.category = validation_data.get('category')
                        waste_report.severity = validation_data.get('severity')
                        waste_report.response_time = validation_data.get('response_time')
                        waste_report.status = 'pending'
                        print(f"Valid report: category={waste_report.category}, severity={waste_report.severity}")
                    else:
                        # Invalid report - mark as invalid
                        waste_report.status = 'invalid'
                        print(f"Invalid report: {validation_data.get('reason', 'Unknown reason')}")
                else:
                    # Classifier returned error, mark as pending for manual review
                    print(f"Validator error, keeping as pending")
            except requests.exceptions.RequestException as e:
                # If validator fails, log error but mark as pending for manual review
                print(f"Error calling environment validator: {str(e)}")
                pass
        else:
            print("No photo in request.FILES")

        # Handle voice note upload
        if 'voice_note' in request.FILES:
            waste_report.voice_note = request.FILES['voice_note']

        waste_report.save()
        print(f"Final report saved with category={waste_report.category}, severity={waste_report.severity}")

        # Update user profile - increment issues_reported
        profile = request.user.userprofile
        profile.issues_reported += 1
        profile.save()

        serializer = WasteReportSerializer(waste_report)
        return Response({
            "message": "Waste report created successfully!",
            "report": serializer.data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_reports(request):
    """Get all reports for the current user"""
    try:
        reports = WasteReport.objects.filter(user=request.user).order_by('-created_at')
        serializer = WasteReportSerializer(reports, many=True)
        return Response({
            "count": reports.count(),
            "reports": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report_stats(request):
    """Get report statistics for the current user"""
    try:
        total_reports = WasteReport.objects.filter(user=request.user).count()
        resolved_reports = WasteReport.objects.filter(user=request.user, status='resolved').count()
        in_progress = WasteReport.objects.filter(user=request.user, status='in-progress').count()
        pending = WasteReport.objects.filter(user=request.user, status='pending').count()

        return Response({
            "total_reports": total_reports,
            "resolved": resolved_reports,
            "in_progress": in_progress,
            "pending": pending
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
