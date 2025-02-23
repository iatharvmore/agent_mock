import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function Report() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadResults = () => {
      const storedResults = localStorage.getItem('interviewResults');
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        const summary = generateOverallFeedback(parsedResults);
        setOverallFeedback(summary);
      }
    };
    loadResults();
  }, []);

  const generateOverallFeedback = (results) => {
    const totalQuestions = results.length;
    const strengths = [];
    const improvements = [];

    results.forEach(result => {
      const feedback = result.feedback.toLowerCase();
      if (feedback.includes('good') || feedback.includes('excellent') || feedback.includes('great')) {
        strengths.push(result.question);
      }
      if (feedback.includes('improve') || feedback.includes('could') || feedback.includes('should')) {
        improvements.push(result.question);
      }
    });

    return `Overall Performance Summary:
    
Total Questions Answered: ${totalQuestions}

Key Strengths:
${strengths.length > 0 ? strengths.map(q => `- ${q}`).join('\n') : '- No specific strengths highlighted'}

Areas for Improvement:
${improvements.length > 0 ? improvements.map(q => `- ${q}`).join('\n') : '- No specific improvements highlighted'}`;
  };

  const sendEmailReport = async () => {
    try {
      setIsSending(true);
      const report = `AI Mock Interview Report\n\n${results.map((result, index) => `
Question ${index + 1}: ${result.question}
Your Answer: ${result.answer}
Feedback: ${result.feedback}
-------------------`).join('\n')}

Overall Feedback:
${overallFeedback}`;

      await fetch('https://hook.eu2.make.com/tc9m4eyhgkbe2x91xwlz7esqdd1nq86q', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, report })
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const startNewInterview = () => {
    localStorage.removeItem('interviewResults');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-8">
            <img src="/Twemoji_1f351.svg.png" alt="MockDiddy Logo" className="h-12 w-12 mr-3" />
            <h1 className="text-3xl font-bold text-center text-white">Interview Report</h1>
          </div>

          <div className="space-y-8">
            {results.map((result, index) => (
              <div key={index} className="border-b border-gray-700 pb-6">
                <h3 className="text-xl font-semibold mb-4">Question {index + 1}</h3>
                <div className="mb-4">
                  <p className="font-medium">Question:</p>
                  <p className="ml-4 text-gray-300">{result.question}</p>
                </div>
                <div className="mb-4">
                  <p className="font-medium">Your Answer:</p>
                  <p className="ml-4 text-gray-300">{result.answer}</p>
                </div>
                <div>
                  <p className="font-medium">Feedback:</p>
                  <p className="ml-4 text-gray-300">{result.feedback}</p>
                </div>
              </div>
            ))}
          </div>

          {overallFeedback && (
            <div className="mt-8 bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Overall Performance</h2>
              <pre className="whitespace-pre-wrap text-gray-300">{overallFeedback}</pre>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {showSuccess && (
              <div className="bg-green-500 text-white p-4 rounded-lg text-center mb-4">
                Report sent successfully! Redirecting...
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-700 rounded-lg bg-black text-white"
              disabled={isSending}
            />
            <button
              onClick={sendEmailReport}
              disabled={isSending || !email}
              className="w-full btn btn-primary flex items-center justify-center space-x-2 bg-white text-black p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSending ? 'Sending...' : 'Send to Email'}</span>
            </button>
            <button
              onClick={startNewInterview}
              className="w-full btn btn-secondary flex items-center justify-center space-x-2 bg-gray-700 text-white p-2 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;