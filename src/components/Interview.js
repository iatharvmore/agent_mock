import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Editor from '@monaco-editor/react';
import { MicrophoneIcon, StopIcon, ClockIcon, SpeakerWaveIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Header from './Header';

function Interview({ genAI }) {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [allResponses, setAllResponses] = useState([]);
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes per question
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [recognition, setRecognition] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const webcamRef = useRef(null);
  const openaiRef = useRef(null);



  // Initialize OpenAI for Whisper
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setAnswer(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Recognition error: ${event.error}`);
        setIsRecording(false);
      };
      
      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
  }, []);

  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      if (recognition) {
        recognition.start();
        setIsRecording(true);
        setError('');
      } else {
        setError('Speech recognition is not initialized.');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const speakText = async (text) => {
    try {
      // If already playing, stop the current audio
      if (isPlayingAudio && audioPlayer) {
        audioPlayer.pause();
        setIsPlayingAudio(false);
        return;
      }

      setIsPlayingAudio(true);
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      setAudioPlayer(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      });

      audio.play();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setError('Failed to generate speech. Please try again.');
      setIsPlayingAudio(false);
    }
  };

  // Clean up audio and recognition resources
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
      }
    };
  }, [recognition, audioPlayer]);
  const handleAnswerSubmit = useCallback(async () => {
    setIsTimerRunning(false);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Evaluate this answer for a ${getQuestionType(currentQuestionIndex)} question:
        Question: ${currentQuestion}
        Answer: ${getQuestionType(currentQuestionIndex) === 'coding' ? code : answer}
        Provide brief, constructive feedback focusing on key points.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const newFeedback = response.text().trim();
      setFeedback(newFeedback);

      const newResponse = {
        question: currentQuestion,
        answer: getQuestionType(currentQuestionIndex) === 'coding' ? code : answer,
        feedback: newFeedback,
        type: getQuestionType(currentQuestionIndex)
      };

      const updatedResponses = [...allResponses, newResponse];
      setAllResponses(updatedResponses);

      if (currentQuestionIndex === 9) {
        localStorage.setItem('interviewResults', JSON.stringify(updatedResponses));
        navigate('/report');
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswer('');
        setCode('');
        setFeedback('');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedback('Error generating feedback. Please try again.');
    }
  }, [currentQuestionIndex, currentQuestion, code, answer, allResponses, genAI, navigate]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleAnswerSubmit();
    }
    return () => clearInterval(interval);
  }, [timer, isTimerRunning, handleAnswerSubmit]);

  useEffect(() => {
    const generateQuestion = async () => {
      try {
        const interviewData = JSON.parse(localStorage.getItem('interviewData'));
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Act as a technical interviewer. Generate a ${getQuestionType(currentQuestionIndex)} question for a ${interviewData.jobRole} position. 
          Experience level: ${interviewData.experienceLevel}
          Job Description: ${interviewData.jobDescription}
          Keep the response clean and simple without any formatting or additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        setCurrentQuestion(response.text().trim());
        setTimer(300); // Reset timer for new question
        setIsTimerRunning(true);
      } catch (error) {
        console.error('Error generating question:', error);
        setCurrentQuestion('Error generating question. Please try again.');
      }
    };

    generateQuestion();
  }, [currentQuestionIndex, genAI]);

  // Automatically speak new questions
  useEffect(() => {
    if (currentQuestion && !isPlayingAudio) {
      speakText(currentQuestion);
    }
  }, [currentQuestion]);

  const getQuestionType = (index) => {
    if (index === 0) return 'introduction';
    if (index >= 1 && index <= 3) return 'aptitude';
    if (index >= 4 && index <= 6) return 'technical';
    return 'coding';
  };


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Add stopwatch timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const endInterview = () => {
    if (window.confirm('Are you sure you want to end the interview? This will save your progress and generate a report.')) {
      setIsInterviewActive(false);
      const updatedResponses = [...allResponses];
      localStorage.setItem('interviewResults', JSON.stringify(updatedResponses));
      navigate('/report');
    }
  };

  // Prevent navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isInterviewActive) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInterviewActive]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header disableNavigation={isInterviewActive} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-black px-4 py-2 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-white" />
                <span className="font-mono text-lg">{formatElapsedTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={endInterview}
            className="btn bg-red-600 text-white flex items-center space-x-2 hover:bg-gray-700"
          >
            <XCircleIcon className="h-5 w-5" />
            <span>End Interview</span>
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Question and Answer */}
          <div className="space-y-6 animate-fade-in">
            <div className="bg-black p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1}/10
                  </span>
                  <span className="text-gray-400 font-medium capitalize">
                    {getQuestionType(currentQuestionIndex)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => speakText(currentQuestion)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                    title={isPlayingAudio ? "Stop Speaking" : "Read Question"}
                  >
                    <SpeakerWaveIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg shadow-inner mb-6">
                <p className="text-lg text-white">{currentQuestion}</p>
              </div>
              {error && (
                <div className="mb-4 p-4 bg-gray-800 border-l-4 border-red-500 text-red-400 rounded-md animate-fade-in">
                  {error}
                </div>
              )}
              {getQuestionType(currentQuestionIndex) === 'coding' ? (
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <Editor
                    height="400px"
                    defaultLanguage="javascript"
                    value={code}
                    onChange={setCode}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      padding: { top: 20 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="input h-40 resize-none bg-black text-white border-gray-600"
                  />
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={startRecording}
                      disabled={isRecording || isProcessingSpeech}
                      className={`btn ${isRecording ? 'bg-red-700' : 'bg-black'} text-white flex items-center`}
                    >
                      <MicrophoneIcon className="h-5 w-5 mr-2" />
                      {isRecording ? 'Recording...' : isProcessingSpeech ? 'Processing...' : 'Start Recording'}
                    </button>
                    <button
                      onClick={stopRecording}
                      disabled={!isRecording}
                      className="btn bg-gray-600 text-white flex items-center hover:bg-gray-500"
                    >
                      <StopIcon className="h-5 w-5 mr-2" />
                      Stop Recording
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Right side - Webcam and Progress */}
          <div className="space-y-6 animate-fade-in flex flex-col items-center">
            <div className="bg-black p-6 rounded-lg shadow-lg w-full">
              <h3 className="text-lg font-semibold mb-4 text-white">Video Preview</h3>
              <div className="rounded-lg overflow-hidden shadow-lg w-100 h-50">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  className="w-full h-full"
                  screenshotFormat="image/jpeg"
                />
              </div>
            </div>
            <button
              onClick={handleAnswerSubmit}
              className="btn bg-white text-black w-full mt-4 flex items-center justify-center hover:bg-gray-600"
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;
