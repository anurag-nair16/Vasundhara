import google.generativeai as genai

genai.configure(api_key="AIzaSyCVzn5jzU_P8DctTeWreVek9tw_nh4b4Ig")

models = genai.list_models()

for m in models:
    print("MODEL:", m.name)
    print("SUPPORTED METHODS:", m.supported_generation_methods)
    print("-" * 40)
