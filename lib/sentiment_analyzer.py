import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

class SentimentAnalyzer:
    """
    A utility class for performing sentiment analysis using NLTK's VADER.
    """
    def __init__(self):
        # Ensure 'vader_lexicon' is downloaded.
        # This check prevents errors if not downloaded by the user.
        try:
            nltk.data.find('sentiment/vader_lexicon.zip')
        except nltk.downloader.DownloadError:
            print("Downloading 'vader_lexicon' for NLTK. This may take a moment...")
            nltk.download('vader_lexicon')
        self.analyzer = SentimentIntensityAnalyzer()

    def get_sentiment_score(self, text):
        """
        Analyzes the sentiment of the given text using VADER.

        Args:
            text (str): The text to analyze.

        Returns:
            dict: A dictionary containing 'neg', 'neu', 'pos', and 'compound' scores.
        """
        return self.analyzer.polarity_scores(text)

