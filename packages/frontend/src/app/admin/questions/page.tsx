import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Question {
  id: string;
  title: string;
  content: string;
  options: string[];
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  author: {
    name: string;
    email: string;
  };
  _count: {
    answers: number;
    comments: number;
  };
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions Management</h1>
        <button
          onClick={() => router.push('/admin/questions/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Question
        </button>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <div key={question.id} className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{question.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">{question.content}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Options:</strong>
                <ul className="list-disc list-inside">
                  {question.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p><strong>Status:</strong> {question.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Answers:</strong> {question._count.answers}</p>
                <p><strong>Comments:</strong> {question._count.comments}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                <strong>Start Date:</strong>{' '}
                {question.startDate ? format(new Date(question.startDate), 'PPP') : 'Not set'}
              </p>
              <p>
                <strong>End Date:</strong>{' '}
                {question.endDate ? format(new Date(question.endDate), 'PPP') : 'Not set'}
              </p>
              <p>
                <strong>Created by:</strong> {question.author.name} ({question.author.email})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 