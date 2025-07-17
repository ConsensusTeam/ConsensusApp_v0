'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

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
  optionIndex: number;
  count: number;
  percentage: number;
}

interface UserData {
  ageGroup: string;
  education: string;
  region: string;
}

const AGE_GROUPS = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55+'
];

const EDUCATION_LEVELS = [
  'İlköğretim',
  'Lise',
  'Ön Lisans',
  'Lisans',
  'Yüksek Lisans',
  'Doktora'
];

const REGIONS = [
  'Marmara',
  'Ege',
  'Akdeniz',
  'İç Anadolu',
  'Karadeniz',
  'Doğu Anadolu',
  'Güneydoğu Anadolu'
];

export default function Home() {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnswerStats[] | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    ageGroup: '',
    education: '',
    region: ''
  });

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  useEffect(() => {
    if (question?.id) {
      checkIfAnswered(question.id);
    }
  }, [question]);

  const checkIfAnswered = async (questionId: string) => {
    try {
      // Check localStorage
      const answered = localStorage.getItem(`answered_${questionId}`);
      if (answered) {
        setHasAnswered(true);
        setStats(JSON.parse(answered));
        return;
      }

      // If not in localStorage, check with backend
      const deviceId = await getDeviceFingerprint();
      const response = await fetch(`http://localhost:3001/api/questions/${questionId}/check-answer`, {
        headers: {
          'X-Device-ID': deviceId,
          ...(user && { Authorization: `Bearer ${localStorage.getItem('token')}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasAnswered) {
          setHasAnswered(true);
          setStats(data.stats);
          localStorage.setItem(`answered_${questionId}`, JSON.stringify(data.stats));
        }
      }
    } catch (error) {
      console.error('Error checking answer status:', error);
    }
  };

  const fetchDailyQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/questions/daily');
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Şu anda aktif bir soru bulunmamaktadır. Lütfen daha sonra tekrar deneyin.');
        } else {
          setError('Soru yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
        return;
      }

      const data = await response.json();
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching daily question:', error);
      setError('Soru yüklenirken bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!question || !selectedOption) return;
    if (!userData.ageGroup || !userData.education || !userData.region) {
      setError('Lütfen tüm bilgileri doldurun.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const deviceId = await getDeviceFingerprint();
      const response = await fetch('http://localhost:3001/api/questions/daily/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': deviceId,
          ...(user && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
        },
        body: JSON.stringify({
          questionId: question.id,
          optionIndex: question.options.indexOf(selectedOption),
          ...userData
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setError('Bu soruyu daha önce cevapladınız.');
          setHasAnswered(true);
          const data = await response.json();
          if (data.stats) {
            setStats(data.stats);
            localStorage.setItem(`answered_${question.id}`, JSON.stringify(data.stats));
          }
          return;
        }
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      setStats(data.stats);
      localStorage.setItem(`answered_${question.id}`, JSON.stringify(data.stats));
      setHasAnswered(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Cevabınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
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
              Tekrar Dene
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
                disabled={isSubmitting || hasAnswered}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${(isSubmitting || hasAnswered) ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedOption && !hasAnswered && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yaş Grubu
                </label>
                <select
                  value={userData.ageGroup}
                  onChange={(e) => setUserData({ ...userData, ageGroup: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seçiniz</option>
                  {AGE_GROUPS.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eğitim Seviyesi
                </label>
                <select
                  value={userData.education}
                  onChange={(e) => setUserData({ ...userData, education: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seçiniz</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coğrafi Bölge
                </label>
                <select
                  value={userData.region}
                  onChange={(e) => setUserData({ ...userData, region: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seçiniz</option>
                  {REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !userData.ageGroup || !userData.education || !userData.region}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors ${
                  isSubmitting || !userData.ageGroup || !userData.education || !userData.region
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Cevabı Gönder'}
              </button>
            </div>
          )}

          {stats && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Sonuçlar</h3>
              <div className="space-y-4">
                {question.options.map((option, index) => {
                  const stat = stats.find(s => s.optionIndex === index);
                  const count = stat?.count || 0;
                  const total = stats.reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{option}</span>
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {count} oy
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
