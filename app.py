from flask import Flask, jsonify, request
from flask_cors import CORS
from lib.rss_reader import fetch_rss_articles
from lib.sentiment_analyzer import SentimentAnalyzer
from lib.speech_synthesizer import TTSConverter

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize VADER sentiment analyzer
analyzer = SentimentAnalyzer()

# Initialize TTS converter
tts_converter = TTSConverter() # New instance

@app.route('/scrape-news', methods=['GET'])
def scrape_news():
    """
    Fetches news from RSS feeds, performs sentiment analysis,
    and returns the top 5 most positive news articles.
    """
    rss_urls = [
        "https://thehimalayantimes.com/rssFeed/15", # Main News
        "https://thehimalayantimes.com/rssFeed/19"  # Business News
    ]

    all_articles = fetch_rss_articles(rss_urls) # Use the modularized function

    if 'error' in all_articles: # Check for errors returned by fetch_rss_articles
        return jsonify(all_articles), all_articles.get('status_code', 500)

    positive_news_articles = []
    for article in all_articles:
        text_for_analysis = article['title'] + " " + article['content']
        vs = analyzer.get_sentiment_score(text_for_analysis)
        
        # Only consider articles with a positive compound score
        if vs['compound'] >= 0.05: # Threshold for positive sentiment
            positive_news_articles.append({
                "title": article['title'],
                "url": article['url'],
                "content": article['content'],
                "sentiment_score": vs['compound']
            })
    
    # Sort all positive articles by sentiment score in descending order
    # Then select only the top 5
    top_5_positive_articles = sorted(positive_news_articles, key=lambda x: x['sentiment_score'], reverse=True)[:5]

    if not top_5_positive_articles:
        return jsonify({
            "error": "No positive articles could be retrieved from the RSS feeds or none met the top 5 criteria.",
            "details": "The RSS feeds might be empty or contain only neutral/negative news."
        }), 500

    return jsonify(top_5_positive_articles)

@app.route('/read-article', methods=['POST']) # New endpoint for TTS
def read_article():
    """
    Receives text content and converts it to speech, returning audio data.
    """
    data = request.json
    article_text = data.get('text', '')

    if not article_text:
        return jsonify({"error": "No text provided for audio conversion."}), 400

    # Use the modularized TTS converter
    audio_base64 = tts_converter.convert_to_audio_base64(article_text)

    if audio_base64:
        # Return base64 encoded audio with MIME type
        return jsonify({"audio": audio_base64, "mime_type": "audio/mp3"})
    else:
        return jsonify({"error": "Failed to convert text to speech."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

