'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  options: string[];
  _count: {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<AnswerStats[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const fetchDailyQuestion = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/questions/daily');
      if (!response.ok) {
        throw new Error('Failed to fetch daily question');
      }
      const data = await response.json();
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching daily question:', error);
      setError('Failed to load daily question');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/questions/daily/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
        },
        body: JSON.stringify({
          questionId: question?.id,
          selectedOption,
          education: 'High School', // TODO: Get from form or user profile
          ageRange: '18-24',
          region: 'North America',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Today's Question</h2>
            {user?.isPremium && (
              <Link href="/questions/create">
                <Button variant="outline">Create Question</Button>
              </Link>
            )}
          </div>

          {question ? (
            <>
              <h3 className="text-xl mb-4">{question.title}</h3>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      selectedOption === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSubmitAnswer}
                  isLoading={isSubmitting}
                  className="w-full"
                  disabled={!selectedOption}
                >
                  Submit Answer
                </Button>
              </div>

              {stats.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium mb-4">Results</h4>
                  <div className="space-y-3">
                    {stats.map((stat) => (
                      <div key={stat.selectedOption} className="flex items-center">
                        <div className="w-32">{stat.selectedOption}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(stat._count / question._count.answers) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="w-20 text-right">
                          {Math.round((stat._count / question._count.answers) * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
