from flask import Flask, jsonify, request
from flask_cors import CORS
from lib.rss_reader import fetch_rss_articles
from lib.sentiment_analyzer import SentimentAnalyzer
from lib.tts_converter import TTSConverter
from lib.news_curator import NewsCurator # New import

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize modules
analyzer = SentimentAnalyzer()
tts_converter = TTSConverter()
news_curator = NewsCurator() # New instance

@app.route('/get-news', methods=['POST']) # Changed to POST to receive preferences
def get_news():
    """
    Fetches news based on user preferences, performs sentiment analysis,
    and returns the top 5 most positive news articles filtered by frequency.
    """
    data = request.json # Get JSON data from frontend POST request
    country = data.get('country', 'Global')
    frequency = data.get('frequency', 'daily')
    themes = data.get('themes', []) # themes will be a list

    # Step 1: Get relevant RSS feeds based on preferences
    relevant_rss_urls = news_curator.get_relevant_rss_feeds(country, themes)
    
    if not relevant_rss_urls:
        return jsonify({
            "error": "No RSS feeds found for the selected preferences.",
            "details": "Please adjust your country/theme selections."
        }), 400

    # Step 2: Fetch articles from selected RSS feeds
    all_fetched_articles = fetch_rss_articles(relevant_rss_urls)

    if 'error' in all_fetched_articles:
        return jsonify(all_fetched_articles), all_fetched_articles.get('status_code', 500)

    # Step 3: Filter articles by frequency
    frequency_filtered_articles = news_curator.filter_by_frequency(all_fetched_articles, frequency)

    if not frequency_filtered_articles:
         return jsonify({
            "error": "No articles found for the selected frequency.",
            "details": "Try a different frequency or broaden your search."
        }), 404


    # Step 4: Perform sentiment analysis and gather positive news
    positive_news_articles = []
    for article in frequency_filtered_articles:
        text_for_analysis = article['title'] + " " + article['content']
        vs = analyzer.get_sentiment_score(text_for_analysis)
        
        if vs['compound'] >= 0.05: # Threshold for positive sentiment
            positive_news_articles.append({
                "title": article['title'],
                "url": article['url'],
                "content": article['content'],
                "sentiment_score": vs['compound']
            })
    
    # Step 5: Sort and select top 5 most positive articles
    top_5_positive_articles = sorted(positive_news_articles, key=lambda x: x['sentiment_score'], reverse=True)[:5]

    if not top_5_positive_articles:
        return jsonify({
            "error": "No positive articles could be retrieved for the selected criteria or none met the top 5.",
            "details": "Try adjusting your preferences or check back later."
        }), 404

    return jsonify(top_5_positive_articles)

@app.route('/read-article', methods=['POST'])
def read_article():
    """
    Receives text content and converts it to speech, returning audio data.
    """
    data = request.json
    article_text = data.get('text', '')

    if not article_text:
        return jsonify({"error": "No text provided for audio conversion."}), 400

    audio_base64 = tts_converter.convert_to_audio_base64(article_text)

    if audio_base64:
        return jsonify({"audio": audio_base64, "mime_type": "audio/mp3"})
    else:
        return jsonify({"error": "Failed to convert text to speech."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

