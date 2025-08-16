export class APIClient {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
    }

    /**
     * Fetches news articles from the backend API.
     * @returns {Promise<Array<Object>>} - A promise that resolves with an array of articles.
     * @throws {Error} - Throws an error if the fetch fails or the backend returns an error.
     */
    async fetchNews() {
        const response = await fetch(this.backendUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
        }
        return data;
    }
}
