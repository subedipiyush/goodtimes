export class APIClient {
    constructor(backendBaseUrl) {
        this.newsApiEndpoint = `${backendBaseUrl}/get-news`;
        this.readArticleApiEndpoint = `${backendBaseUrl}/read-article`;
    }

    /**
     * Fetches news articles from the backend API based on preferences.
     * @param {Object} preferences - Object containing country, frequency, themes.
     * @returns {Promise<Array<Object>>} - A promise that resolves with an array of articles.
     * @throws {Error} - Throws an error if the fetch fails or the backend returns an error.
     */
    async fetchNews(preferences) {
        const response = await fetch(this.newsApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    /**
     * Calls the backend to convert text to speech.
     * @param {string} text - The text content to convert to speech.
     * @returns {Promise<Object>} - A promise that resolves with { audio: base64String, mime_type: string }.
     * @throws {Error} - Throws an error if the fetch fails or the backend returns an error.
     */
    async readArticle(text) {
        const response = await fetch(this.readArticleApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
}
