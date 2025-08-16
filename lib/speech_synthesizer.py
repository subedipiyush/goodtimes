from gtts import gTTS
import io
import base64

class TTSConverter:
    """
    A utility class for converting text to speech using Google Text-to-Speech (gTTS).
    """
    def __init__(self):
        pass # gTTS doesn't require explicit initialization here beyond import

    def convert_to_audio_base64(self, text, lang='en'):
        """
        Converts text to speech and returns the audio data as a base64 encoded string.

        Args:
            text (str): The text to convert to speech.
            lang (str): The language of the text (e.g., 'en' for English).

        Returns:
            str: Base64 encoded audio data (MP3 format).
        """
        if not text:
            return None

        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            # gTTS can write to a file-like object (BytesIO)
            audio_fp = io.BytesIO()
            tts.write_to_fp(audio_fp)
            audio_fp.seek(0) # Rewind to the beginning of the file-like object

            # Encode the audio bytes to base64
            base64_audio = base64.b64encode(audio_fp.read()).decode('utf-8')
            return base64_audio
        except Exception as e:
            print(f"Error converting text to speech: {e}")
            return None

