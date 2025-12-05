import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from utils.response_time import get_response_time
import json
import tempfile
import os
import re
import time
import traceback

# Initialize client
genai.configure(api_key="AIzaSyBfe9T7BefMy3eRxcY3ilgE6FQ5viuMfdw")
# Use Gemini 2.0 Flash - latest model with vision support
MODEL_NAME = "gemini-2.0-flash"

app = FastAPI()

CATEGORIES = ["garbage", "road", "fire", "water", "construction", "air"]

@app.post("/classify")
async def classify(image: UploadFile = File(...)):
    tmp_path = None
    try:
        # Read image bytes
        img_bytes = await image.read()
        
        # Validate image
        if len(img_bytes) == 0:
            return JSONResponse({"error": "Empty image file"}, 400)
        
        # Save image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(img_bytes)
            tmp_path = tmp.name
        
        # Upload to Gemini
        uploaded_file = genai.upload_file(tmp_path)
        
        # Wait for file processing (important for large files)
        while uploaded_file.state.name == "PROCESSING":
            time.sleep(1)
            uploaded_file = genai.get_file(uploaded_file.name)
        
        if uploaded_file.state.name == "FAILED":
            return JSONResponse({"error": "File processing failed"}, 500)
        
        # Improved prompt with stricter JSON formatting
        prompt = """Analyze this image and classify the civic issue shown.

You must return ONLY a valid JSON object with no additional text, markdown, or explanation.

Categories (choose one):
- garbage: litter, trash piles, waste dumping
- road: potholes, damaged roads, broken pavement
- fire: fires, smoke, burning
- water: leaks, flooding, water damage, broken pipes
- construction: illegal construction, building issues, debris
- air: pollution, dust, smoke (non-fire)

Severity levels:
- high: immediate danger, urgent action needed
- medium: significant issue, needs attention soon
- low: minor issue, routine maintenance

Return format:
{"category": "one_of_the_categories", "severity": "high_medium_or_low"}

Example: {"category": "road", "severity": "high"}"""

        # Generate content with retry logic
        max_retries = 3
        retry_delay = 2
        response = None
        
        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel(MODEL_NAME)
                response = model.generate_content([uploaded_file, prompt])
                break  # Success, exit retry loop
            except Exception as api_error:
                error_str = str(api_error)
                # Check if it's a quota error
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if attempt < max_retries - 1:
                        # Extract retry delay from error if available
                        delay_match = re.search(r'retry in (\d+\.?\d*)', error_str.lower())
                        if delay_match:
                            retry_delay = float(delay_match.group(1))
                        
                        time.sleep(retry_delay)
                        continue
                    else:
                        return JSONResponse({
                            "error": "API quota exceeded",
                            "message": "Please wait a moment and try again, or check your API quota at https://ai.dev/usage",
                            "retry_after_seconds": retry_delay
                        }, 429)
                else:
                    # Non-quota error, raise it
                    raise
        
        if response is None:
            return JSONResponse({"error": "Failed to get response from classifier"}, 500)
        
        # Extract and clean response
        raw_text = response.text.strip()
        
        # Remove markdown code blocks if present
        raw_text = re.sub(r'```json\s*|\s*```', '', raw_text)
        raw_text = raw_text.strip()
        
        # Parse JSON
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            # Try to extract JSON from text
            json_match = re.search(r'\{[^}]+\}', raw_text)
            if json_match:
                data = json.loads(json_match.group())
            else:
                return JSONResponse({
                    "error": "Invalid JSON response from AI",
                    "raw_response": raw_text
                }, 500)
        
        # Extract and validate category
        category = data.get("category", "").lower().strip()
        if category not in CATEGORIES:
            return JSONResponse({
                "error": f"Invalid category: {category}",
                "valid_categories": CATEGORIES,
                "raw_response": data
            }, 400)
        
        # Extract and validate severity
        severity = data.get("severity", "").lower().strip()
        if severity not in ["low", "medium", "high"]:
            return JSONResponse({
                "error": f"Invalid severity: {severity}",
                "valid_severities": ["low", "medium", "high"],
                "raw_response": data
            }, 400)
        
        # Calculate response time
        response_time = get_response_time(severity)
        
        return {
            "category": category,
            "severity": severity,
            "response_time": response_time
        }
    
    except json.JSONDecodeError as e:
        return JSONResponse({
            "error": "Failed to parse AI response as JSON",
            "details": str(e)
        }, 500)
    
    except Exception as e:
        print(f"Classification error: {str(e)}")
        traceback.print_exc()
        return JSONResponse({
            "error": "Classification failed",
            "details": str(e)
        }, 500)
    
    finally:
        # Clean up temporary file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except:
                pass


@app.post("/validate")
async def validate_report(image: UploadFile = File(...), description: str = Form(...)):
    """Validate if the image is environment-related and matches the description"""
    tmp_path = None
    try:
        # Read image bytes
        img_bytes = await image.read()
        
        # Validate image
        if len(img_bytes) == 0:
            return JSONResponse({"error": "Empty image file"}, 400)
        
        # Save image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(img_bytes)
            tmp_path = tmp.name
        
        # Upload to Gemini
        uploaded_file = genai.upload_file(tmp_path)
        
        # Wait for file processing
        while uploaded_file.state.name == "PROCESSING":
            time.sleep(1)
            uploaded_file = genai.get_file(uploaded_file.name)
        
        if uploaded_file.state.name == "FAILED":
            return JSONResponse({"error": "File processing failed"}, 500)
        
        # Validation prompt
        prompt = f"""Analyze this image and the given description to validate if this is a legitimate civic/environmental issue report.

USER'S DESCRIPTION: "{description}"

You must check:
1. Is the image related to an environmental/civic issue? Valid categories are:
   - garbage: litter, trash piles, waste dumping, overflowing bins
   - road: potholes, damaged roads, broken pavement, road damage
   - fire: fires, smoke from fire, burning
   - water: leaks, flooding, water damage, broken pipes, water pollution
   - construction: illegal construction, building issues, debris, structural damage
   - air: air pollution, dust clouds, industrial smoke (non-fire)

2. Does the user's description reasonably match what is shown in the image?
   - The description should describe the same type of issue visible in the image
   - Minor wording differences are acceptable, but the core issue must match

Return ONLY a valid JSON object with no additional text:

If VALID (image is environment-related AND description matches):
{{"is_valid": true, "category": "one_of_the_categories", "severity": "high_medium_or_low", "reason": "brief explanation"}}

If INVALID (not environment-related OR description doesn't match):
{{"is_valid": false, "reason": "clear explanation of why it's invalid"}}

Severity levels:
- high: immediate danger, urgent action needed
- medium: significant issue, needs attention soon  
- low: minor issue, routine maintenance"""

        # Generate content with retry logic
        max_retries = 3
        retry_delay = 2
        response = None
        
        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel(MODEL_NAME)
                response = model.generate_content([uploaded_file, prompt])
                break
            except Exception as api_error:
                error_str = str(api_error)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if attempt < max_retries - 1:
                        delay_match = re.search(r'retry in (\d+\.?\d*)', error_str.lower())
                        if delay_match:
                            retry_delay = float(delay_match.group(1))
                        time.sleep(retry_delay)
                        continue
                    else:
                        return JSONResponse({
                            "error": "API quota exceeded",
                            "message": "Please wait a moment and try again",
                            "retry_after_seconds": retry_delay
                        }, 429)
                else:
                    raise
        
        if response is None:
            return JSONResponse({"error": "Failed to get response from validator"}, 500)
        
        # Extract and clean response
        raw_text = response.text.strip()
        raw_text = re.sub(r'```json\s*|\s*```', '', raw_text)
        raw_text = raw_text.strip()
        
        # Parse JSON
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[^}]+\}', raw_text)
            if json_match:
                data = json.loads(json_match.group())
            else:
                return JSONResponse({
                    "error": "Invalid JSON response from AI",
                    "raw_response": raw_text
                }, 500)
        
        is_valid = data.get("is_valid", False)
        
        if is_valid:
            # Validate category and severity
            category = data.get("category", "").lower().strip()
            if category not in CATEGORIES:
                return {"is_valid": False, "reason": f"Invalid category detected: {category}"}
            
            severity = data.get("severity", "").lower().strip()
            if severity not in ["low", "medium", "high"]:
                severity = "medium"  # Default to medium if not valid
            
            response_time = get_response_time(severity)
            
            return {
                "is_valid": True,
                "category": category,
                "severity": severity,
                "response_time": response_time,
                "reason": data.get("reason", "Validation passed")
            }
        else:
            return {
                "is_valid": False,
                "reason": data.get("reason", "Image is not related to environmental issues or description doesn't match")
            }
    
    except Exception as e:
        print(f"Validation error: {str(e)}")
        traceback.print_exc()
        return JSONResponse({
            "error": "Validation failed",
            "details": str(e)
        }, 500)
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
