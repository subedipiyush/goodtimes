export class UIManager {
    constructor(loadingIndicatorId, generateNewsBtnId, newsOutputId, messageBoxId, messageTextId, readAllHeadlinesBtnId) {
        this.loadingIndicator = document.getElementById(loadingIndicatorId);
        this.generateNewsBtn = document.getElementById(generateNewsBtnId);
        this.newsOutputDiv = document.getElementById(newsOutputId);
        this.messageBox = document.getElementById(messageBoxId);
        this.messageText = document.getElementById(messageTextId);
        this.readAllHeadlinesBtn = document.getElementById(readAllHeadlinesBtnId); // New button reference
        this.currentPlayingAudioButton = null; // Track which button initiated playback
    }

    /**
     * Shows the loading indicator and disables the generate button.
     */
    showLoadingState() {
        this.loadingIndicator.classList.remove('hidden');
        this.generateNewsBtn.disabled = true;
        this.generateNewsBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    /**
     * Hides the loading indicator and enables the generate button.
     */
    hideLoadingState() {
        this.loadingIndicator.classList.add('hidden');
        this.generateNewsBtn.disabled = false;
        this.generateNewsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    /**
     * Clears the news output area.
     */
    clearNewsOutput() {
        this.newsOutputDiv.innerHTML = '';
    }

    /**
     * Displays a message in the message box.
     * @param {string} text - The message text.
     * @param {string} type - 'success' or 'error'.
     */
    showMessage(text, type = 'success') {
        const messageBox = this.messageBox; // Reference messageBox directly
        const messageText = this.messageText; // Reference messageText directly

        messageText.textContent = text;
        messageBox.className = `fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 3000); // Hide after 3 seconds
    }

    /**
     * Displays news articles in the output area, including 'Read Aloud' buttons.
     * @param {Array<Object>} articles - An array of news article objects.
     * @param {Function} onReadAloudClick - Callback function for 'Read Aloud' button clicks.
     */
    displayNews(articles, onReadAloudClick) {
        this.clearNewsOutput();
        if (articles.length === 0) {
            this.newsOutputDiv.innerHTML = `<p class="text-center text-gray-500">No good news found today. Try again later!</p>`;
            return;
        }

        articles.forEach((article, index) => {
            const articleCard = document.createElement('div');
            articleCard.className = 'news-card';
            articleCard.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${article.title}</h3>
                <p class="text-gray-700 mb-3">${article.content.substring(0, 150)}...</p>
                <div class="flex items-center justify-between mt-4">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Read more &rarr;</a>
                    <button id="readAloudBtn-${index}"
                            class="read-aloud-btn bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full text-sm shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                        Read Aloud
                    </button>
                </div>
            `;
            this.newsOutputDiv.appendChild(articleCard);

            // Attach event listener to the newly created button
            const readAloudBtn = document.getElementById(`readAloudBtn-${index}`);
            if (readAloudBtn) {
                readAloudBtn.addEventListener('click', () => {
                    onReadAloudClick(article.content, readAloudBtn);
                });
            }
        });
    }

    /**
     * Displays an error message directly in the news output area.
     * @param {string} messageHtml - The HTML string for the error message.
     */
    displayError(messageHtml) {
        this.newsOutputDiv.innerHTML = `<p class="text-center text-red-500">${messageHtml}</p>`;
    }

    /**
     * Displays the initial welcome message.
     */
    displayInitialMessage() {
        this.newsOutputDiv.innerHTML = `<p class="text-center text-gray-500">Click "Generate Good News!" to fetch today's positive headlines.</p>`;
    }

    /**
     * Disables all "Read Aloud" buttons.
     */
    disableAllReadAloudButtons() {
        document.querySelectorAll('.read-aloud-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        });
    }

    /**
     * Enables all "Read Aloud" buttons.
     */
    enableAllReadAloudButtons() {
        document.querySelectorAll('.read-aloud-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        });
    }

    /**
     * Disables the "Read Headlines" button.
     */
    disableReadAllHeadlinesButton() {
        if (this.readAllHeadlinesBtn) {
            this.readAllHeadlinesBtn.disabled = true;
            this.readAllHeadlinesBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Enables the "Read Headlines" button.
     */
    enableReadAllHeadlinesButton() {
        if (this.readAllHeadlinesBtn) {
            this.readAllHeadlinesBtn.disabled = false;
            this.readAllHeadlinesBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Shows the "Read Headlines" button.
     */
    showReadAllHeadlinesButton() {
        if (this.readAllHeadlinesBtn) {
            this.readAllHeadlinesBtn.style.display = ''; // Revert to default display (e.g., flex)
        }
    }

    /**
     * Hides the "Read Headlines" button.
     */
    hideReadAllHeadlinesButton() {
        if (this.readAllHeadlinesBtn) {
            this.readAllHeadlinesBtn.style.display = 'none';
        }
    }

    /**
     * Marks a specific button as playing, updating its text.
     * Disables all other buttons.
     * @param {HTMLElement} button - The button element that is playing.
     */
    setPlayingState(button) {
        this.currentPlayingAudioButton = button;
        this.disableAllReadAloudButtons();
        this.disableReadAllHeadlinesButton(); // Disable the read-all button too
        if (button) {
            button.textContent = 'Playing...';
            button.disabled = false; // Keep this one enabled for potential stop/pause functionality later
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Resets the playing state, re-enables all buttons.
     */
    resetPlayingState() {
        if (this.currentPlayingAudioButton) {
            this.currentPlayingAudioButton.textContent = 'Read Aloud';
            this.currentPlayingAudioButton = null;
        }
        this.enableAllReadAloudButtons();
        this.enableReadAllHeadlinesButton(); // Re-enable the read-all button
    }
}
