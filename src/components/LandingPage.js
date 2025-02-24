import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

function LandingPage() {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate('/input');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
      <div className="absolute top-4 right-4 flex space-x-6 p-2">
        <a href="https://github.com/iatharvmore" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-3xl transition">
          <FaGithub />
        </a>
        <a href="https://www.linkedin.com/in/atharv-more-0498b524b/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-3xl transition">
          <FaLinkedin />
        </a>
      </div>
      
      <motion.div 
        className="w-full max-w-2xl text-center space-y-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold">💼</h1>
        <h1 className="text-4xl font-bold">Agent Mock</h1>
        <p className="text-lg text-gray-400">
          Enhance your interview skills with AI-powered mock interviews tailored to your needs.
        </p>
        <motion.button
          onClick={handleStartInterview}
          className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Take Interview
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="mt-16 w-full max-w-3xl space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <section>
          <h2 className="text-2xl font-semibold">About the App</h2>
          <p className="text-gray-400">
          Agent Mock is an AI-powered platform designed to help individuals enhance their interview skills through personalized mock interview sessions. The platform provides interactive and insightful experiences tailored to the user's needs, whether they are preparing for technical interviews, HR rounds, or general job screenings.

Key Features:
AI-Powered Mock Interviews: Simulates real-world interview scenarios to help users practice and gain confidence.
Personalized Feedback: Uses AI to provide tailored feedback based on the user's responses.
Intuitive UI/UX: A simple and modern interface for a seamless experience.
Animated and Responsive Design: Uses Framer Motion for animations and React components for a smooth and engaging user interface.
Social Links & Profile: Showcases the developer’s profile with links to GitHub and LinkedIn.
This project is aimed at bridging the gap between candidates and their dream jobs by offering a structured and interactive approach to interview preparation.
          </p>
        </section>
        <section className="flex flex-col items-center text-center">
          <img src="./me.png" alt="Atharv Santoshkumar More" className="w-48 h-48 rounded-full shadow-lg mb-4" />
          <h2 className="text-2xl font-semibold">About Me</h2>
          <p className="text-gray-400">
            Hi, I'm Atharv Santoshkumar More, a passionate developer with expertise in AI, NLP, and web technologies. 
            I created Agent Mock to bridge the gap between candidates and their dream jobs by offering interactive and insightful 
            interview experiences powered by cutting-edge AI.
          </p>
        </section>
      </motion.div>
    </div>
  );
}

export default LandingPage;
