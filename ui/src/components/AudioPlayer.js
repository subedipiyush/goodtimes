'use client';

export class AudioPlayer {
    constructor() {
        this.audioElement = new Audio();
        // Optional: Add event listeners for debugging or UI feedback
        this.audioElement.onplay = () => console.log('Audio playing...');
        this.audioElement.onended = () => console.log('Audio ended.');
        this.audioElement.onerror = (e) => console.error('Audio error:', e);
    }

    /**
     * Plays base64 encoded audio data.
     * @param {string} base64Audio - The base64 encoded audio string.
     * @param {string} mimeType - The MIME type of the audio (e.g., 'audio/mp3').
     */
    playBase64Audio(base64Audio, mimeType) {
        if (!base64Audio) {
            console.error('No audio data provided to play.');
            return;
        }

        const audioSrc = `data:${mimeType};base64,${base64Audio}`;
        this.audioElement.src = audioSrc;
        this.audioElement.play().catch(error => {
            console.error('Error playing audio:', error);
            // In a real app, you might show a user-friendly message here
            // e.g., "Browser blocked autoplay. Please click play."
        });
    }

    /**
     * Stops the currently playing audio.
     */
    stopAudio() {
        if (!this.audioElement.paused) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0; // Rewind to start
        }
    }
}