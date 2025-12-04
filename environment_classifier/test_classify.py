import requests
import os

# minimal 1x1 PNG
png_bytes = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde"
    b"\x00\x00\x00\x0bIDAT\x08\xd7c```\x00\x00\x00\x04\x00\x01\x0d\n\x2dB\x00\x00\x00\x00IEND\xaeB`\x82"
)

fn = "tmp_test_image.png"
with open(fn, "wb") as f:
    f.write(png_bytes)

url = "http://localhost:8001/classify"
with open(fn, "rb") as f:
    files = {"image": (fn, f, "image/png")}
    try:
        r = requests.post(url, files=files, timeout=30)
        print("status:", r.status_code)
        try:
            print(r.json())
        except Exception:
            print(r.text)
    except Exception as e:
        print("request failed:", e)

os.remove(fn)
