"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { Mic, StopCircle, Loader2, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { useCurrentUser } from "@/lib/auth-storage";

const RecordAnswerSection = ({ 
  mockInterviewQuestion, 
  activeQuestionIndex, 
  interviewData, 
  onAnswerSave,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [noSpeechRetries, setNoSpeechRetries] = useState(0);
  const noSpeechRetriesRef = useRef(0);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const MAX_NO_SPEECH_RETRIES = 2;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    setSpeechSupported(Boolean(SpeechRecognition));

    if (typeof window !== "undefined" && SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTranscript.trim()) {
          setUserAnswer(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognition.onerror = (event) => {
        // Provide clearer guidance for common speech-recognition errors
        if (event?.error === 'no-speech') {
          // Retry automatically a few times before failing
          if (noSpeechRetriesRef.current < MAX_NO_SPEECH_RETRIES) {
            noSpeechRetriesRef.current += 1;
            setNoSpeechRetries(noSpeechRetriesRef.current);
            toast.info(`No speech detected. Retrying (${noSpeechRetriesRef.current}/${MAX_NO_SPEECH_RETRIES})...`);
            try {
              // restart after a short pause
              setTimeout(() => {
                recognitionRef.current?.start();
                setIsRecording(true);
              }, 700);
            } catch (e) {
              console.warn('Retry start failed', e);
            }
          } else {
            toast.error('No speech detected. Make sure your microphone is unmuted and speak clearly.');
            noSpeechRetriesRef.current = 0;
            setNoSpeechRetries(0);
            setIsRecording(false);
          }
        } else if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
          toast.error('Microphone access denied. Please enable microphone permissions for this site.');
          setIsRecording(false);
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const EnableWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      setWebcamEnabled(true);
      toast.success("Webcam and microphone enabled successfully");
    } catch (error) {
      toast.error("Failed to enable webcam", {
        description: "Please check your camera permissions"
      });
      console.error("Webcam error:", error);
    }
  };

  const DisableWebcam = () => {
    const tracks = webcamRef.current?.srcObject?.getTracks();
    tracks?.forEach(track => track.stop());
    setWebcamEnabled(false);
  };

  const StartStopRecording = async () => {
    if (!recognitionRef.current) {
      toast.error("Speech-to-text not supported in this browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      toast.info("Recording stopped");
      setIsRecording(false);
      return;
    }

    // Ensure microphone permission is granted (some browsers need a getUserMedia prompt)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permError) {
      console.error('Microphone access error:', permError);
      toast.error('Microphone access denied or not available. Please allow microphone and try again.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Recording started");
    } catch (startError) {
      console.error('Failed to start speech recognition:', startError);
      toast.error('Failed to start speech recognition. Please try again.');
      setIsRecording(false);
    }
  };

  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setLoading(true);

    try {
      let feedbackData = { rating: 0, feedback: "Feedback could not be generated." };

      try {
        const feedbackGenResponse = await fetch('/api/interviews/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: mockInterviewQuestion[activeQuestionIndex]?.question,
            userAnswer,
          })
        });

        const parsedFeedback = await feedbackGenResponse.json();

        if (feedbackGenResponse.ok) {
          feedbackData = parsedFeedback;
        } else {
          console.warn('Feedback generation failed, saving answer without AI feedback:', parsedFeedback?.message);
        }
      } catch (feedbackError) {
        console.warn('Feedback generation error, saving answer without AI feedback:', feedbackError);
      }

      if (!user?.email) {
        throw new Error("Please sign in before saving an answer");
      }

      const answerRecord = {
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: feedbackData?.feedback ?? "Feedback could not be generated.",
        rating: String(feedbackData?.rating ?? 0),
        userEmail: user.email,
        createdAt: moment().format("DD-MM-YYYY"),
      };

      const response = await fetch(`/api/interviews/${interviewData?.mockId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answerRecord),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save answer");
      }

      onAnswerSave?.(answerRecord);

      toast.success("Answer recorded successfully");
      
      setUserAnswer("");
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } catch (error) {
      toast.error("Failed to save answer", {
        description: error.message
      });
      console.error("Answer save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col relative">
      {loading && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex flex-col justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-white mb-4" />
          <p className="text-white text-lg">Saving your answer...</p>
        </div>
      )}
      <div className="flex flex-col my-20 justify-center items-center bg-black rounded-lg p-5">
        {webcamEnabled ? (
          <video 
            ref={webcamRef} 
            autoPlay 
            playsInline 
            className="w-[200px] h-[200px] object-cover rounded-lg"
          />
        ) : (
          <div className="w-[200px] h-[200px] flex justify-center items-center bg-gray-200 rounded-lg">
            <p className="text-gray-500">Webcam Disabled</p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={webcamEnabled ? DisableWebcam : EnableWebcam}
        >
          {webcamEnabled ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" /> Disable Webcam
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" /> Enable Webcam
            </>
          )}
        </Button>
      </div>

      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 items-center animate-pulse flex gap-2">
            <StopCircle /> Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      <div className="text-center mt-2 text-sm text-gray-500">
        {!speechSupported && (
          <div>
            Your browser may not support speech recognition. Try Chrome or Edge.
          </div>
        )}
        <div>Tip: Allow microphone, speak immediately after pressing Record.</div>
        <a
          className="underline text-primary"
          href="https://webspeech.github.io/demo/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Test Microphone / Speech Demo
        </a>
      </div>

      <textarea
        className="w-full h-32 p-4 mt-4 border rounded-md text-gray-800"
        placeholder="Your answer will appear here..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
    
      <Button
        className="mt-4"
        onClick={UpdateUserAnswer}
        disabled={loading || !userAnswer.trim()}
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          "Save Answer"
        )}
      </Button>
    </div>
  );
};

export default RecordAnswerSection;