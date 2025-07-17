'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsData {
  overall: Array<{ selectedOption: string; _count: number }>;
  byEducation: Array<{ education: string; selectedOption: string; _count: number }>;
  byAgeRange: Array<{ ageRange: string; selectedOption: string; _count: number }>;
  byRegion: Array<{ region: string; selectedOption: string; _count: number }>;
}

interface QuestionStatsProps {
  questionId: string;
}

export function QuestionStats({ questionId }: QuestionStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overall' | 'education' | 'age' | 'region'>('overall');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [questionId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/${questionId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (): ChartData<'bar'> | null => {
    if (!stats) return null;

    switch (activeTab) {
      case 'overall':
        return {
          labels: stats.overall.map(item => item.selectedOption),
          datasets: [{
            label: 'Responses',
            data: stats.overall.map(item => item._count),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          }]
        };

      case 'education':
        const educationLabels = [...new Set(stats.byEducation.map(item => item.education))];
        const educationOptions = [...new Set(stats.byEducation.map(item => item.selectedOption))];
        
        return {
          labels: educationLabels,
          datasets: educationOptions.map((option, index) => ({
            label: option,
            data: educationLabels.map(edu => 
              stats.byEducation.find(item => item.education === edu && item.selectedOption === option)?._count || 0
            ),
            backgroundColor: `hsla(${index * 60}, 70%, 60%, 0.5)`,
          }))
        };

      case 'age':
        const ageLabels = [...new Set(stats.byAgeRange.map(item => item.ageRange))];
        const ageOptions = [...new Set(stats.byAgeRange.map(item => item.selectedOption))];
        
        return {
          labels: ageLabels,
          datasets: ageOptions.map((option, index) => ({
            label: option,
            data: ageLabels.map(age => 
              stats.byAgeRange.find(item => item.ageRange === age && item.selectedOption === option)?._count || 0
            ),
            backgroundColor: `hsla(${index * 60}, 70%, 60%, 0.5)`,
          }))
        };

      case 'region':
        const regionLabels = [...new Set(stats.byRegion.map(item => item.region))];
        const regionOptions = [...new Set(stats.byRegion.map(item => item.selectedOption))];
        
        return {
          labels: regionLabels,
          datasets: regionOptions.map((option, index) => ({
            label: option,
            data: regionLabels.map(region => 
              stats.byRegion.find(item => item.region === region && item.selectedOption === option)?._count || 0
            ),
            backgroundColor: `hsla(${index * 60}, 70%, 60%, 0.5)`,
          }))
        };

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overall')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'overall'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Overall
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'education'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          By Education
        </button>
        <button
          onClick={() => setActiveTab('age')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'age'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          By Age
        </button>
        <button
          onClick={() => setActiveTab('region')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'region'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          By Region
        </button>
      </div>

      {chartData && (
        <div className="h-96">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: `Response Distribution ${
                    activeTab !== 'overall' ? `by ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : ''
                  }`,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
} 