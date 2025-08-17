# src/news_curator.py

from datetime import datetime, timedelta, timezone # Import timezone

class NewsCurator:
    def __init__(self):
        # Mock mapping of preferences to RSS feed URLs
        # In a real app, this would be a database or a more complex source discovery system.
        self.source_map = {
            'country': {
                'Global': [
                    "https://thehimalayantimes.com/rssFeed/15", # Example: General News
                    "https://thehimalayantimes.com/rssFeed/19"  # Example: Business News
                ],
                'Nepal': [
                    "https://thehimalayantimes.com/rssFeed/15", # Primary Nepali source
                    # Add more Nepal-specific feeds if available
                ],
                # Add more countries and their specific RSS feeds
                'USA': [
                    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", # Mock - NYT
                    "https://feeds.a.dj.com/rss/RssCommon.xml" # Mock - WSJ Top News
                ],
                'UK': [
                    "http://feeds.bbci.co.uk/news/rss.xml", # Mock - BBC News
                    "https://www.theguardian.com/uk/rss" # Mock - Guardian UK
                ]
            },
            'theme': {
                'Economy': ["https://thehimalayantimes.com/rssFeed/19", "https://feeds.a.dj.com/rss/RssCommon.xml"],
                'Humanitarian': ["https://thehimalayantimes.com/rssFeed/15"], # General news might contain
                'Education': ["https://thehimalayantimes.com/rssFeed/15"], # General news might contain
                'Peace': ["https://thehimalayantimes.com/rssFeed/15"], # General news might contain
                # Add more themes and relevant feeds
            }
        }

    def get_relevant_rss_feeds(self, country='Global', themes=None):
        """
        Selects RSS feeds based on country and themes.
        For simplicity, if themes are specified, it tries to intersect feeds.
        Otherwise, it uses country-specific feeds.
        """
        selected_feeds = set()

        # Start with country-specific feeds
        if country in self.source_map['country']:
            selected_feeds.update(self.source_map['country'][country])
        elif 'Global' in self.source_map['country']: # Fallback to Global if country not found
             selected_feeds.update(self.source_map['country']['Global'])


        # If themes are provided, try to refine the feeds (simplified logic)
        if themes:
            theme_feeds = set()
            for theme in themes:
                if theme in self.source_map['theme']:
                    theme_feeds.update(self.source_map['theme'][theme])
            
            # If both country and theme feeds are available, take the intersection
            if selected_feeds and theme_feeds:
                selected_feeds = selected_feeds.intersection(theme_feeds)
            elif theme_feeds: # If only theme feeds are found, use them
                selected_feeds = theme_feeds

        # If no feeds found, fall back to global as a last resort
        if not selected_feeds and 'Global' in self.source_map['country']:
            selected_feeds.update(self.source_map['country']['Global'])

        return list(selected_feeds)

    def filter_by_frequency(self, articles, frequency='daily'):
        """
        Filters news articles based on the specified frequency.
        Assumes article has a 'pub_date' field (string).
        """
        if not articles:
            return []

        # Get current time in UTC and make it timezone-aware
        now = datetime.now(timezone.utc)
        filtered_articles = []

        for article in articles:
            pub_date_str = article.get('pub_date')
            if not pub_date_str:
                continue # Skip article if pub_date is missing

            try:
                # Parse the publication date string into a timezone-aware datetime object
                # Common RSS date format: 'Thu, 15 Aug 2025 08:00:00 +0000'
                # Ensure it's converted to UTC for consistent comparison
                pub_date = datetime.strptime(pub_date_str, '%a, %d %b %Y %H:%M:%S %z').astimezone(timezone.utc)
            except ValueError:
                # Handle cases where the date format might vary or be invalid
                # You might log this or try other common formats
                # print(f"Warning: Could not parse pub_date '{pub_date_str}' for article: {article.get('title', 'N/A')}")
                continue # Skip article if date cannot be parsed

            # Calculate timedelta based on frequency
            time_difference = now - pub_date

            if frequency == 'daily':
                if time_difference <= timedelta(days=1):
                    filtered_articles.append(article)
            elif frequency == 'weekly':
                if time_difference <= timedelta(weeks=1):
                    filtered_articles.append(article)
            elif frequency == 'monthly':
                # Approximate for a month (30 days)
                if time_difference <= timedelta(days=30):
                    filtered_articles.append(article)
            else: # Default case or 'all' frequency
                filtered_articles.append(article)
        
        return filtered_articles

