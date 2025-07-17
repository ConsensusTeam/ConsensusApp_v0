'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  content: string;
  options: string[];
  _count?: {
    answers: number;
  };
}

interface AnswerStats {
  selectedOption: string;
  _count: number;
}

export default function Home() {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const fetchDailyQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/questions/daily');
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No daily question available at the moment. Please check back later.');
        } else {
          setError('Failed to load daily question. Please try again later.');
        }
        return;
      }

      const data = await response.json();
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching daily question:', error);
      setError('Failed to load daily question. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <p>{error}</p>
            <button 
              onClick={fetchDailyQuestion}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">{question.title}</h2>
          <p className="text-gray-600 mb-6">{question.content}</p>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="mt-6">
              <button
                onClick={() => {/* TODO: Implement answer submission */}}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
