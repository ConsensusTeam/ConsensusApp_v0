import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface QuestionForm {
  title: string;
  content: string;
  options: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const initialForm: QuestionForm = {
  title: '',
  content: '',
  options: ['', ''],
  startDate: '',
  endDate: '',
  isActive: false
};

export default function QuestionFormPage() {
  const [form, setForm] = useState<QuestionForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const isEdit = params.action === 'edit';
  const questionId = isEdit ? params.id : null;

  useEffect(() => {
    if (isEdit && questionId) {
      fetchQuestion();
    }
  }, [isEdit, questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await response.json();
      setForm({
        title: data.title,
        content: data.content,
        options: data.options,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        isActive: data.isActive
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch question');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit 
        ? `/api/admin/questions/${questionId}`
        : '/api/admin/questions';
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      router.push('/admin/questions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (form.options.length <= 2) return;
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Question' : 'Create New Question'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            className="w-full border rounded p-2 h-32"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Options</label>
          {form.options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={e => updateOption(index, e.target.value)}
                className="flex-1 border rounded p-2"
                placeholder={`Option ${index + 1}`}
                required
              />
              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="text-blue-500 hover:text-blue-700"
          >
            Add Option
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
            id="isActive"
          />
          <label htmlFor="isActive">Make question active</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Question'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/questions')}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 