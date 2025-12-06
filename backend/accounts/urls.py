from django.urls import path
from .views import SignupView, LoginView, ProfileView, process_image, create_waste_report, get_user_reports, get_report_stats
from .views import receive_issue, get_all_reports

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('process-image/', process_image, name='process_image'),
    path('report/', create_waste_report, name='create_waste_report'),
    path('reports/', get_user_reports, name='get_user_reports'),
    path('all-reports/', get_all_reports, name='get_all_reports'),
    path('report-stats/', get_report_stats, name='get_report_stats'),
    path("api/save-issue/", receive_issue),

]

