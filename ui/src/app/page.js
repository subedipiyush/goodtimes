'use client';

import React, { useState, useEffect, useRef } from 'react';
import PreferencesForm from '@/components/PreferencesForm';
import NewsDisplay from '@/components/NewsDisplay';
import { APIClient } from '@/lib/api';
import { AudioPlayer } from '@/components/AudioPlayer';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://127.0.0.1:5000';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPlayingHeadlineButton, setCurrentPlayingHeadlineButton] = useState(null);
  const [currentPlayingArticleButton, setCurrentPlayingArticleButton] = useState(null);

  // New state for subscription form
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('daily');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState(null); // For success/error messages

  const audioPlayerRef = useRef(null);
  const apiClient = new APIClient(BACKEND_BASE_URL);

  useEffect(() => {
    if (audioPlayerRef.current === null) {
      audioPlayerRef.current = new AudioPlayer();

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
  }, []);

  const handleGetNews = async (preferences) => {
    setLoading(true);
    setError(null);
    setNews([]);
    if (audioPlayerRef.current) audioPlayerRef.current.stopAudio();

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

  // New function to handle subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscriptionMessage(null);

    try {
      const result = await apiClient.subscribeToNews(subscriptionEmail, subscriptionFrequency);
      setSubscriptionMessage({ type: 'success', text: result.message });
      setSubscriptionEmail(''); // Clear email field on success
    } catch (err) {
      console.error("Error subscribing:", err);
      setSubscriptionMessage({ type: 'error', text: err.message || "Failed to subscribe. Please try again." });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col gap-8">      
      {/* "Good Times" heading styled to mimic The New York Times masthead */}
      <h1 className="text-6xl font-serif font-extrabold text-center text-gray-900 leading-none mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
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

      {/* New Subscription Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-purple-200 mt-8">
        <h2 className="text-2xl font-semibold text-purple-800 mb-5">Subscribe to Good News!</h2>
        <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2"
              placeholder="you@example.com"
              value={subscriptionEmail}
              onChange={(e) => setSubscriptionEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Email Frequency</label>
            <select
              id="frequency"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2"
              value={subscriptionFrequency}
              onChange={(e) => setSubscriptionFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubscribing}
          >
            {isSubscribing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        {subscriptionMessage && (
          <div className={`mt-4 p-3 rounded-md ${subscriptionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {subscriptionMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}
