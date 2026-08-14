import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GroqPharmaLLMClient:
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemma2-9b-it"):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.model_name = model_name or "gemma2-9b-it"
        self.client = None

        if self.api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")

    def call_groq_json(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        """Call Groq API expecting JSON response."""
        if not self.client:
            return None
        
        try:
            full_system = system_prompt + "\nReturn ONLY valid JSON matching the requested structure."
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": full_system},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            logger.error(f"Groq API call error: {e}")
            return None

def get_llm_client(api_key: Optional[str] = None, model_name: str = "gemma2-9b-it") -> GroqPharmaLLMClient:
    return GroqPharmaLLMClient(api_key=api_key, model_name=model_name)
