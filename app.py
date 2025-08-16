import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify
from flask_cors import CORS
import time
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize VADER sentiment analyzer
# IMPORTANT: Ensure 'vader_lexicon' is downloaded:
# import nltk
# nltk.download('vader_lexicon')
analyzer = SentimentIntensityAnalyzer()

@app.route('/scrape-news', methods=['GET'])
def scrape_news():
    """
    Reads headlines and summaries from The Himalayan Times RSS feeds,
    performs sentiment analysis, and returns the top 5 most positive news.
    """
    rss_urls = [
        "https://thehimalayantimes.com/rssFeed/15", # Main News
        "https://thehimalayantimes.com/rssFeed/19"  # Business News
    ]
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*; q=0.01', # Accept XML for RSS feeds
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }
    all_positive_articles = [] # Collect all positive articles first
    max_retries = 3
    retry_delay = 1 # seconds

    for url in rss_urls:
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, 'lxml-xml')
                items = soup.find_all('item')

                for item in items:
                    title_tag = item.find('title')
                    link_tag = item.find('link')
                    description_tag = item.find('description')

                    title = title_tag.get_text(strip=True) if title_tag else "No Title"
                    link = link_tag.get_text(strip=True) if link_tag else "#"
                    description = BeautifulSoup(description_tag.get_text(strip=True), 'html.parser').get_text(strip=True) if description_tag else ""

                    if title and link and link != "#":
                        text_for_analysis = title + " " + description
                        vs = analyzer.polarity_scores(text_for_analysis)
                        
                        # Only consider articles with a positive compound score
                        if vs['compound'] >= 0.05: # Threshold for positive sentiment
                            all_positive_articles.append({
                                "title": title,
                                "url": link,
                                "content": description if description else title,
                                "sentiment_score": vs['compound'] # Keep score for sorting
                            })
                
                if items: # If articles were found for this URL, no need to retry this URL
                    break
                
                print(f"Attempt {attempt + 1} for {url}: No RSS items found. Retrying...")
                time.sleep(retry_delay * (2 ** attempt))

            except requests.exceptions.HTTPError as e:
                error_message = f"HTTP Error {e.response.status_code} for {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: HTTP error. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return jsonify({"error": "Failed to fetch news from RSS due to an HTTP error.", "details": error_message}), e.response.status_code
            except requests.exceptions.ConnectionError as e:
                error_message = f"Connection Error to {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: Connection error. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return jsonify({"error": "Failed to connect to the RSS feed after multiple retries.", "details": error_message}), 503
            except requests.exceptions.Timeout as e:
                error_message = f"Timeout Error for {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: Timeout. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return jsonify({"error": "Request to RSS feed timed out after multiple retries.", "details": error_message}), 504
            except Exception as e:
                error_message = f"An unexpected error occurred while processing {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: Unexpected error. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return jsonify({"error": "Failed to parse RSS feed content due to an unexpected error.", "details": error_message}), 500

    # Sort all positive articles by sentiment score in descending order
    # Then select only the top 5
    top_5_positive_articles = sorted(all_positive_articles, key=lambda x: x['sentiment_score'], reverse=True)[:5]

    if not top_5_positive_articles:
        return jsonify({"error": "No positive articles could be retrieved from the RSS feeds or none met the top 5 criteria. Try adjusting the sentiment threshold or checking the RSS URLs.", "details": "The RSS feeds might be empty or contain only neutral/negative news."}), 500

    return jsonify(top_5_positive_articles)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

