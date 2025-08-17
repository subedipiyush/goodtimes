'use client'; // This directive makes this component a Client Component in Next.js

import React, { useState, useEffect, useRef } from 'react';
import PreferencesForm from '../components/PreferencesForm';
import NewsDisplay from '../components/NewsDisplay';
import { APIClient } from '../lib/api';
import { AudioPlayer } from '../components/AudioPlayer';

// IMPORTANT: Update this with your deployed backend URL.
// For Next.js, it's common to use environment variables for this.
// Create a .env.local file in frontend-nextjs/ and add:
// NEXT_PUBLIC_BACKEND_BASE_URL=http://127.0.0.1:5000
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://127.0.0.1:5000';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPlayingHeadlineButton, setCurrentPlayingHeadlineButton] = useState(null);
  const [currentPlayingArticleButton, setCurrentPlayingArticleButton] = useState(null);

  // Use useRef to hold the AudioPlayer instance so it persists across renders
  // and is only initialized on the client side.
  const audioPlayerRef = useRef(null);

  // Initialize APIClient outside useEffect as it doesn't depend on browser APIs
  const apiClient = new APIClient(BACKEND_BASE_URL);

  useEffect(() => {
    // This code only runs on the client side after the component mounts
    if (audioPlayerRef.current === null) {
      audioPlayerRef.current = new AudioPlayer();

      // Attach event listeners to the audio element once it's initialized
      audioPlayerRef.current.audioElement.onended = () => {
        setCurrentPlayingHeadlineButton(null);
        setCurrentPlayingArticleButton(null);
      };
      audioPlayerRef.current.audioElement.onerror = (e) => {
        console.error('Audio playback error:', e);
        setCurrentPlayingHeadlineButton(null);
        setCurrentPlayingArticleButton(null);
        setError('Failed to play audio.');
      };
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleGetNews = async (preferences) => {
    setLoading(true);
    setError(null);
    setNews([]);
    if (audioPlayerRef.current) audioPlayerRef.current.stopAudio(); // Ensure player exists before stopping

    try {
      const fetchedNews = await apiClient.fetchNews(preferences);
      setNews(fetchedNews);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err.message || "Failed to fetch news. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloudArticle = async (articleContent, buttonElement) => {
    if (!audioPlayerRef.current) {
      setError("Audio player not ready. Please try again.");
      return;
    }
    audioPlayerRef.current.stopAudio();
    setCurrentPlayingHeadlineButton(null);
    setCurrentPlayingArticleButton(buttonElement);

    try {
      const audioData = await apiClient.readArticle(articleContent);
      audioPlayerRef.current.playBase64Audio(audioData.audio, audioData.mime_type);
    } catch (err) {
      console.error("Error reading article:", err);
      setError(err.message || "Failed to generate audio for article.");
      setCurrentPlayingArticleButton(null);
    }
  };

  const handleReadAllHeadlines = async () => {
    if (!audioPlayerRef.current) {
      setError("Audio player not ready. Please try again.");
      return;
    }
    audioPlayerRef.current.stopAudio();
    setCurrentPlayingArticleButton(null);

    const headlines = news.map(article => article.title);
    if (headlines.length === 0) {
      setError("No headlines to read!");
      return;
    }
    const combinedHeadlines = "Here are the top headlines: " + headlines.join(". ") + ".";

    const readAllButton = document.getElementById('readAllHeadlinesBtn');
    if (readAllButton) setCurrentPlayingHeadlineButton(readAllButton);

    try {
      const audioData = await apiClient.readArticle(combinedHeadlines);
      audioPlayerRef.current.playBase64Audio(audioData.audio, audioData.mime_type);
    } catch (err) {
      console.error("Error reading all headlines:", err);
      setError(err.message || "Failed to generate audio for headlines.");
      setCurrentPlayingHeadlineButton(null);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col gap-8">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-6 tracking-tight leading-tight">
        Good Times ✨
      </h1>
      <p className="text-lg text-center text-gray-600 mb-8 max-w-xl mx-auto">
        Your personalized dose of positive news, curated to your preferences.
      </p>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-200">
        <h2 className="text-2xl font-semibold text-blue-800 mb-5">Set Your Preferences</h2>
        <PreferencesForm onSubmit={handleGetNews} loading={loading} />
      </div>

      {loading && (
        <div className="flex items-center justify-center space-x-3 text-lg text-gray-700 mt-8">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
          <span>Curating happiness...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-8" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {news.length > 0 && !loading && !error && (
        <NewsDisplay
          news={news}
          onReadAloudArticle={handleReadAloudArticle}
          onReadAllHeadlines={handleReadAllHeadlines}
          currentPlayingHeadlineButton={currentPlayingHeadlineButton}
          currentPlayingArticleButton={currentPlayingArticleButton}
        />
      )}

      {!loading && !error && news.length === 0 && (
        <p className="text-center text-gray-500 mt-8 text-lg">
          Select your preferences and click "Get Good News!" to see today's positive headlines.
        </p>
      )}
    </div>
  );
}
