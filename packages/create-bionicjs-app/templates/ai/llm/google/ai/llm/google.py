import os

from google import genai


def get_client() -> genai.Client:
    return genai.Client(api_key=os.environ["GOOGLE_API_KEY"])