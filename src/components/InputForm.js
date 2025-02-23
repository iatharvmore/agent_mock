import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Header from './Header';

function InputForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobRole: '',
    jobDescription: '',
    experienceLevel: '',
    resume: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('interviewData', JSON.stringify(formData));
    navigate('/interview');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <Header />
      <div className="w-full max-w-4xl bg-black p-8 rounded-lg shadow-lg animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Interview Details</h2>
          <button
            onClick={handleSubmit}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Start Interview
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium">Job Role</label>
            <input
              type="text"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg focus:ring focus:ring-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              rows="5"
              className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg focus:ring focus:ring-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg focus:ring focus:ring-gray-600"
              required
            >
              <option value="">Select Experience Level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior Level (5+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium">Resume (PDF/TXT)</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg cursor-pointer focus:ring focus:ring-gray-600"
              required
            />
          </div>
        </form>
        <div className="flex justify-start mt-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputForm;
