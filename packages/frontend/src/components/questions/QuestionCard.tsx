import { useState } from 'react';
import { format } from 'date-fns';

interface Question {
  id: string;
  title: string;
  content: string;
  options: string[];
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  _count: {
    answers: number;
    comments: number;
  };
}

interface Props {
  question: Question;
  onVote: (optionIndex: number) => void;
  selectedOption?: number;
  showResults?: boolean;
}

export default function QuestionCard({ question, onVote, selectedOption, showResults }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (index: number) => {
    try {
      setError(null);
      await onVote(index);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{question.title}</h2>
      <p className="text-gray-600 mb-6">{question.content}</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleVote(index)}
            disabled={selectedOption !== undefined}
            className={`w-full p-3 text-left rounded transition-colors ${
              selectedOption === index
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } border`}
          >
            {option}
            {showResults && selectedOption !== undefined && (
              <span className="float-right text-gray-600">
                {((question._count.answers || 0) > 0
                  ? (index === selectedOption ? 1 : 0) / question._count.answers * 100
                  : 0).toFixed(1)}%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {question.startDate && (
          <p>Starts: {format(new Date(question.startDate), 'PPP')}</p>
        )}
        {question.endDate && (
          <p>Ends: {format(new Date(question.endDate), 'PPP')}</p>
        )}
        <p className="mt-2">
          Total votes: {question._count.answers || 0}
        </p>
      </div>
    </div>
  );
} 