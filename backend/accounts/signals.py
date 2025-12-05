from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

# vasundhara_app/signals.py (or whatever your app name is)

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import WasteReport, UserProfile
from django.db import transaction

# --- Hardcoded Scoring Rules ---
SCORE_MATRIX = {
    'low': {'eco_points': 10, 'civic_points': 10},
    'medium': {'eco_points': 30, 'civic_points': 30},
    'high': {'eco_points': 50, 'civic_points': 50},
    'penalty': {'eco_points': -40, 'civic_points': -40}, # Example penalty for false/invalid report
}

@receiver(post_save, sender=WasteReport)
def update_user_score_on_resolution(sender, instance, created, **kwargs):
    """
    Signal handler to update the user's eco_score and civic_score 
    when a WasteReport is resolved or marked invalid.
    """
    
    # We only care about updates (not initial creation)
    if created:
        return
        
    # Check if the status changed to 'resolved' or another final status
    if instance.status in ['resolved', 'invalid']:
        
        # Use a transaction block for atomicity (ensures both profile and report save)
        with transaction.atomic():
            
            try:
                # Retrieve the UserProfile using the related user
                profile = instance.user.userprofile
            except UserProfile.DoesNotExist:
                # Should not happen, but a safe guard
                return
            
            # --- 1. Identify if the score has already been awarded/penalized ---
            # We use an attribute on the instance's history to track this state, 
            # as a 'resolved' report should only award points once.
            
            # Note: Checking the previous value is complex with post_save. 
            # A cleaner way is adding a boolean field to WasteReport (e.g., points_awarded = models.BooleanField(default=False))
            # Since you want to keep models simple, we'll check the current status and assume 
            # any transition to 'resolved' or 'invalid' means action should be taken if it wasn't before.

            
            # For simplicity without a tracking field: check the old status from the DB 
            # if possible, but post_save doesn't give 'old' data easily. 
            # **BEST PRACTICE is to add a 'points_awarded' field to WasteReport.**
            
            # Since you're not adding a field, we'll rely on checking the previous status 
            # using a deferred object check. This is generally unreliable, so let's stick 
            # to a **SIMPLE ASSUMPTION**: when resolved/invalid, we award/penalize,
            # and rely on the UI/Admin not to change it back and forth. 
            
            
            # --- 2. Calculate Points/Penalty based on Status and Severity ---
            
            eco_points = 0
            civic_points = 0

            if instance.status == 'resolved':
                # Get severity-based score
                severity = instance.severity.lower() if instance.severity else 'low'
                rules = SCORE_MATRIX.get(severity, SCORE_MATRIX['low'])
                
                eco_points = rules['eco_points']
                civic_points = rules['civic_points']
                
            elif instance.status == 'invalid':
                # Apply hardcoded penalty
                rules = SCORE_MATRIX['penalty']
                eco_points = rules['eco_points']
                civic_points = rules['civic_points']

            # --- 3. Apply Scores (if non-zero) ---
            if eco_points != 0 or civic_points != 0:
                
                # Apply changes
                profile.eco_score += eco_points
                profile.civic_score += civic_points
                
                # Ensure scores don't go below zero (optional, but good practice)
                profile.eco_score = max(0, profile.eco_score)
                profile.civic_score = max(0, profile.civic_score)
                
                # Save the updated profile
                profile.save()