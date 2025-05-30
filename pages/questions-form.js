import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import { FaArrowRight } from "react-icons/fa";
import Link from 'next/link'

const predefinedQuestions = [
  { text: "How many buses they make in a year?", type: "number" },
  { text: "In which sort/category of buses they deal in?", type: "text" },
  { text: "What kind of bus they want to make?", type: "text" },
  { text: "Designation?", type: "text" },
  { text: "Feedback", type: "select", options: ["Excellent","Good", "Satisfactory", "Bad"] },
];

export default function QuestionsForm() {
  const [clientName, setClientName] = useState('');
  const [answers, setAnswers] = useState({});

  const handleChange = (text, value) => {
    setAnswers(prev => ({ ...prev, [text]: value }));
  };

  const handleSubmit = async () => {
    if (!clientName) return toast.warning('Lead Name is required');

    const formattedAnswers = Object.entries(answers).map(([question, answer]) => ({
      question,
      answer,
    }));

    try {
      await axios.post(`${BASE_URL}/api/answers/save-all`, {
        clientName,
        answers: formattedAnswers,
        predefinedQuestions,
      });

      toast.success('Answers submitted and questions saved ✅');
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Lead Questionnaire</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Lead Name</label>
          <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter Client Name"
          />
        </div>

        {predefinedQuestions.map((q, idx) => (
          <div key={idx} className="mb-4">
            <label className="block font-medium text-sm mb-1">{q.text}</label>
            {q.type === 'select' ? (
              <select
                className="w-full border px-3 py-2 rounded"
                value={answers[q.text] || ''}
                onChange={(e) => handleChange(q.text, e.target.value)}
              >
                <option value="">Select</option>
                {q.options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={q.type}
                className="w-full border px-3 py-2 rounded"
                value={answers[q.text] || ''}
                onChange={(e) => handleChange(q.text, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold"
        >
          Submit Answers
        </button>
        <Link href="/dashboard">
  <button className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold transition">
    <FaArrowRight />
    Go to Dashboard
  </button>
</Link>
      </div>
    </div>
  );
}
