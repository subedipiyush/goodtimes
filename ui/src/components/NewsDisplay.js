'use client';

import React from 'react';

function NewsDisplay({ news, onReadAloudArticle, onReadAllHeadlines, currentPlayingHeadlineButton, currentPlayingArticleButton }) {
  const isAnyAudioPlaying = currentPlayingHeadlineButton !== null || currentPlayingArticleButton !== null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Your Curated Good News</h2>
        {news.length > 0 && (
          <button
            onClick={onReadAllHeadlines}
            id="readAllHeadlinesBtn"
            className={`flex items-center px-5 py-2 rounded-full text-white text-lg font-semibold shadow-md transition duration-300 ease-in-out ${
              isAnyAudioPlaying
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75'
            }`}
            disabled={isAnyAudioPlaying}
          >
            {currentPlayingHeadlineButton ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reading All...
              </>
            ) : (
              'Read All Headlines'
            )}
          </button>
        )}
      </div>

      <div className="space-y-5">
        {news.map((article, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 leading-tight">
              {article.title}
            </h3>
            <p className="text-gray-700 mb-4 text-sm leading-normal">
              {article.content.substring(0, 200)}...
            </p>
            <div className="flex items-center justify-between mt-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium text-sm transition-colors duration-200"
              >
                Read more &rarr;
              </a>
              <button
                onClick={() => onReadAloudArticle(article.content, document.getElementById(`readAloudBtn-${index}`))}
                id={`readAloudBtn-${index}`}
                className={`read-aloud-btn flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold shadow-md transition duration-300 ease-in-out transform ${
                  isAnyAudioPlaying
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 hover:scale-105'
                }`}
                disabled={isAnyAudioPlaying}
              >
                {currentPlayingArticleButton?.id === `readAloudBtn-${index}` ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Playing...
                  </>
                ) : (
                  'Read Aloud'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsDisplay;
