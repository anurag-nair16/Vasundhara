import google.generativeai as genai

genai.configure(api_key="AIzaSyCgEdcp1UIu-MedHpyy_MqopG8t6iY5WgM")

models = genai.list_models()

for m in models:
    print("MODEL:", m.name)
    print("SUPPORTED METHODS:", m.supported_generation_methods)
    print("-" * 40)
