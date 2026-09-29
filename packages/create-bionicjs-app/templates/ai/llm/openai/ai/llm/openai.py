from openai import OpenAI

def get_client() -> OpenAI:
    return OpenAI()