import requests
from bs4 import BeautifulSoup
import time

def fetch_rss_articles(rss_urls, max_retries=3, retry_delay=1):
    """
    Fetches and parses articles from a list of RSS feed URLs.

    Args:
        rss_urls (list): A list of RSS feed URLs.
        max_retries (int): Maximum number of retries for a failed request.
        retry_delay (int): Initial delay in seconds for retries (uses exponential backoff).

    Returns:
        list: A list of dictionaries, where each dictionary represents an article
              with 'title', 'url', and 'content'.
        dict: An error dictionary if fetching fails for all URLs after retries.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }
    all_articles = []

    for url in rss_urls:
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

                # Parse as XML, explicitly using 'lxml-xml'
                soup = BeautifulSoup(response.text, 'lxml-xml')

                # Find all <item> tags which represent individual news articles in RSS
                items = soup.find_all('item')

                for item in items:
                    title_tag = item.find('title')
                    link_tag = item.find('link')
                    description_tag = item.find('description')

                    title = title_tag.get_text(strip=True) if title_tag else "No Title"
                    link = link_tag.get_text(strip=True) if link_tag else "#"
                    # Clean up description, as it might contain HTML entities or tags
                    description = BeautifulSoup(description_tag.get_text(strip=True), 'html.parser').get_text(strip=True) if description_tag else ""

                    if title and link and link != "#":
                        all_articles.append({
                            "title": title,
                            "url": link,
                            "content": description if description else title
                        })
                
                if items: # If articles were found for this URL, no need to retry this URL
                    break # Break out of retry loop for this URL
                
                print(f"Attempt {attempt + 1} for {url}: No RSS items found. Retrying...")
                time.sleep(retry_delay * (2 ** attempt)) # Exponential backoff

            except requests.exceptions.HTTPError as e:
                error_message = f"HTTP Error {e.response.status_code} for {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: HTTP error. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return {"error": "Failed to fetch news from RSS due to an HTTP error.", "details": error_message, "status_code": e.response.status_code}
            except requests.exceptions.ConnectionError as e:
                error_message = f"Connection Error to {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: Connection error. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return {"error": "Failed to connect to the RSS feed after multiple retries.", "details": error_message, "status_code": 503}
            except requests.exceptions.Timeout as e:
                error_message = f"Timeout Error for {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: Timeout. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return {"error": "Request to RSS feed timed out after multiple retries.", "details": error_message, "status_code": 504}
            except Exception as e:
                error_message = f"An unexpected error occurred while processing {url}: {e}"
                print(error_message)
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: Unexpected error. Retrying in {retry_delay * (2 ** attempt)} seconds...")
                    time.sleep(retry_delay * (2 ** attempt))
                else:
                    return {"error": "Failed to parse RSS feed content due to an unexpected error.", "details": error_message, "status_code": 500}
    
    # If no articles were found across all URLs after all retries
    if not all_articles:
        return {"error": "No articles could be retrieved from the RSS feeds. Check the RSS URLs or your network connection.", "details": "The RSS feeds might be empty or inaccessible.", "status_code": 500}

    return all_articles

