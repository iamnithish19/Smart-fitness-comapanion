import React, { useState, useEffect, useRef } from 'react';
import * as aiService from '../services/aiService';

export default function AiCoach({ chatMessages = [], user = {}, metrics = {}, onSendMessage, onClearMessages, onExit }) {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyBanner, setShowKeyBanner] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [persona, setPersona] = useState(aiService.getSelectedPersona());
  const [selectedImage, setSelectedImage] = useState(null); // base64 string
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [presetCategory, setPresetCategory] = useState('all');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const key = aiService.getApiKey();
    setApiKey(key);
    setShowKeyBanner(!key);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (autoSpeech && chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg && lastMsg.sender === 'ai') {
        handleSpeakText(lastMsg.text, chatMessages.length - 1);
      }
    }
  }, [chatMessages, isGenerating, autoSpeech]);


  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const [autoSpeech, setAutoSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  const handleSpeakText = (text, msgId) => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    const cleanText = text.replace(/[*_#•-]/g, ' '); // strip markdown symbols for natural speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };


  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Please select an image smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const PRESET_CATEGORIES = [
    { id: 'all', name: '✨ All Presets' },
    { id: 'workout', name: '🏋️ Workouts' },
    { id: 'nutrition', name: '🥗 Nutrition' },
    { id: 'recovery', name: '💤 Sleep & Recovery' },
    { id: 'biohack', name: '🔬 Biohacking' }
  ];

  const PRESETS = [
    { cat: 'workout', label: '🔥 20-min HIIT Burner', prompt: 'Suggest a high-intensity 20-min HIIT workout tailored to my stats.' },
    { cat: 'workout', label: '💪 Hypertrophy Chest & Triceps', prompt: 'Design an optimal hypertrophic chest & triceps workout routine.' },
    { cat: 'nutrition', label: '🥑 Calculate Daily Macros', prompt: 'Analyze my weight and fitness goals and prescribe exact protein, carb, and fat grams.' },
    { cat: 'nutrition', label: '🍗 High-Protein Meal Ideas', prompt: 'Give me 3 fast high-protein meal ideas matching my daily calorie budget.' },
    { cat: 'recovery', label: '💤 Optimize Deep Sleep', prompt: 'Analyze my latest sleep telemetry and tell me how I can increase deep sleep stage hours.' },
    { cat: 'recovery', label: '🧘 Active Recovery Protocol', prompt: 'What active recovery and mobility routine should I do on my rest days?' },
    { cat: 'biohack', label: '⚡ Circadian Energy Stack', prompt: 'Give me a biohacking protocol to maximize daytime alertness and athletic endurance.' },
    { cat: 'biohack', label: '📊 Assess Overall Telemetry', prompt: 'Review my active plans, workouts, vitals, and sleep logs and give me a full progress assessment.' }
  ];

  const filteredPresets = presetCategory === 'all' ? PRESETS : PRESETS.filter(p => p.cat === presetCategory);

  const handlePersonaChange = (newPersonaId) => {
    setPersona(newPersonaId);
    aiService.setSelectedPersona(newPersonaId);
  };

  const handleSaveBannerKey = (e) => {
    e.preventDefault();
    if (!tempKeyInput.trim()) return;
    aiService.setApiKey(tempKeyInput.trim());
    setApiKey(tempKeyInput.trim());
    setShowKeyBanner(false);
    setErrorMsg('');
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if ((!query.trim() && !selectedImage) || isGenerating) return;

    setErrorMsg('');

    // Append user message immediately
    const userMsg = {
      sender: 'user',
      text: query || 'Attached Image for AI Analysis',
      image: selectedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsGenerating(true);

    const currentKey = aiService.getApiKey();

    if (currentKey) {
      try {
        const aiText = await aiService.generateAiResponse({
          prompt: query,
          history: [...chatMessages, userMsg],
          user,
          metrics,
          persona,
          imageBase64: currentImage
        });

        onSendMessage({
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } catch (err) {
        console.error('Gemini AI Error:', err);
        setErrorMsg(`AI Error: ${err.message}`);

        onSendMessage({
          sender: 'ai',
          text: `⚠️ **AI Service Notice**: Unable to complete Gemini API call (${err.message}). \n\n*Fallback Coaching Tip*: Ensure your free Gemini API key is valid in Settings. Remember to hit your daily hydration goal and target 1.8-2.0g protein per kg!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Dynamic Local Demo Responder
      setTimeout(() => {
        const aiText = aiService.getDynamicDemoResponse({
          prompt: query,
          user,
          metrics,
          persona,
          imageBase64: currentImage
        });

        onSendMessage({
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setIsGenerating(false);
      }, 500);
    }
  };

  /** Format text with clean markdown parsing (bold, line breaks, lists) */
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 my-1">
            {formattedParts}
          </li>
        );
      }
      return (
        <p key={idx} className="my-1">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="page-container">
      <header className="page-header flex-between align-center flex-wrap gap-2">
        <div>
          <h1 className="page-title">AI Virtual Fitness Coach</h1>
          <p className="page-subtitle">
            Powered by Google Gemini AI with multi-turn chat, image vision analysis, voice controls & your live vitals.
          </p>
        </div>
        <div className="flex align-center gap-2 flex-wrap">
          <span className={`badge ${apiKey ? 'badge-success' : 'badge-warning'}`}>
            {apiKey ? '🟢 Gemini AI Live' : '🟡 Demo Mode (Key Optional)'}
          </span>
          {onClearMessages && (
            <button
              className="btn btn-secondary text-xs p-2"
              onClick={onClearMessages}
              title="Clear conversation history"
            >
              🗑️ Clear Chat
            </button>
          )}
          {onExit && (
            <button
              className="btn btn-danger text-xs p-2 flex align-center gap-1"
              onClick={onExit}
              title="Exit AI Agent"
            >
              ✖ Exit Agent
            </button>
          )}
        </div>
      </header>

      {/* API Key Banner */}
      {showKeyBanner && (
        <div
          className="card mb-4 p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.4)'
          }}
        >
          <div className="flex-between align-start mb-2">
            <div>
              <h3 className="section-title text-md flex align-center gap-2">
                <span>🔑</span> Connect Free Google Gemini API Key
              </h3>
              <p className="stat-lbl text-xs mt-1">
                Google Gemini API is 100% free with no credit card required. Enter your free API key to activate live personalized responses!
              </p>
            </div>
            <button
              className="btn btn-secondary text-xs p-1 px-2"
              onClick={() => setShowKeyBanner(false)}
            >
              ✕ Dismiss
            </button>
          </div>

          <form onSubmit={handleSaveBannerKey} className="flex gap-2 mt-3 flex-wrap">
            <input
              type="password"
              className="input-field flex-1"
              placeholder="Paste Google Gemini API key (e.g. AIzaSy...)"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary text-xs">
              ⚡ Activate Live AI
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs flex align-center gap-1"
            >
              🔗 Get Free Key (1-Click)
            </a>
          </form>
        </div>
      )}

      {/* Controls Bar: Persona, Auto-Speech, Speed & Preset Filters */}
      <div className="card mb-3 p-3 flex-between align-center flex-wrap gap-3">
        <div className="flex align-center gap-3 flex-wrap flex-1 min-w-250">
          <div className="flex align-center gap-2">
            <span className="text-xs text-secondary font-bold uppercase">Coach Style:</span>
            <select
              className="select-input text-xs"
              style={{ width: '210px' }}
              value={persona}
              onChange={(e) => handlePersonaChange(e.target.value)}
            >
              {aiService.COACH_PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex align-center gap-2 bg-surface p-1 px-2 border-radius">
            <label className="text-xs text-secondary flex align-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeech}
                onChange={(e) => setAutoSpeech(e.target.checked)}
              />
              <span>🔊 Auto-Read Out Loud</span>
            </label>

            <select
              className="select-input text-xs py-0"
              style={{ width: '80px', height: '26px' }}
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
            >
              <option value={0.8}>0.8x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>

          {/* Animated Audio Equalizer Waveform when speaking */}
          {speakingMsgId !== null && (
            <div className="flex align-center gap-1 bg-surface p-1 px-3 border-radius border-primary">
              <span className="text-xs text-primary font-bold">AI Speaking</span>
              <div className="flex align-end gap-1" style={{ height: '14px' }}>
                <span className="bg-primary animate-pulse" style={{ width: '3px', height: '12px', borderRadius: '2px' }}></span>
                <span className="bg-cyan animate-pulse" style={{ width: '3px', height: '14px', borderRadius: '2px', animationDelay: '0.15s' }}></span>
                <span className="bg-accent animate-pulse" style={{ width: '3px', height: '8px', borderRadius: '2px', animationDelay: '0.3s' }}></span>
              </div>
            </div>
          )}
        </div>

        <div className="flex align-center gap-1 overflow-x-auto py-1">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`btn text-xs py-1 px-2 ${
                presetCategory === cat.id ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => setPresetCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>


      {/* Quick Action Presets */}
      <div className="grid grid-2 sm:grid-4 gap-2 mb-3">
        {filteredPresets.slice(0, 4).map((p, idx) => (
          <button
            key={idx}
            className="btn btn-secondary text-left p-3 text-xs flex-col"
            disabled={isGenerating}
            onClick={() => handleSend(p.prompt)}
          >
            <strong className="text-primary mb-1">{p.label}</strong>
            <span className="stat-lbl opacity-75">{p.prompt}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Container */}
      <div className="card chat-container flex-col" style={{ minHeight: '520px' }}>
        <div className="chat-messages flex-1 overflow-y-auto p-3">
          {chatMessages.length === 0 ? (
            <div className="text-center p-5 my-5 text-secondary">
              <span className="text-5xl block mb-3">🤖</span>
              <h3 className="text-lg font-bold">Welcome, {user.name || 'Athlete'}! I'm your Gemini AI Coach.</h3>
              <p className="stat-lbl mt-2 max-w-md mx-auto">
                Ask me about workouts, protein targets, heart rate telemetry, sleep optimization, or upload a photo of your meal or exercise form for instant AI analysis!
              </p>
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble mb-3 ${
                  msg.sender === 'user' ? 'chat-user ml-auto' : 'chat-ai mr-auto'
                }`}
                style={{
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div className="chat-header flex-between align-center mb-1 gap-2 border-b pb-1">
                  <strong className="text-xs">
                    {msg.sender === 'user' ? `👤 ${user.name || 'You'}` : '🤖 AI Companion Coach'}
                  </strong>
                  <div className="flex align-center gap-2">
                    <span className="chat-time text-xs opacity-60">{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <button
                        className="btn-icon text-xs opacity-75 hover-opacity-100"
                        onClick={() => handleSpeakText(msg.text, i)}
                        title={speakingMsgId === i ? 'Stop Speech' : 'Listen Read Aloud'}
                      >
                        {speakingMsgId === i ? '🔊 Speaking...' : '🔈 Read Aloud'}
                      </button>
                    )}
                  </div>
                </div>

                {msg.image && (
                  <div className="my-2">
                    <img
                      src={msg.image}
                      alt="Uploaded for AI analysis"
                      style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </div>
                )}

                <div className="chat-body text-sm leading-relaxed mt-1">
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="chat-bubble chat-ai mr-auto mb-3" style={{ maxWidth: '85%' }}>
              <div className="flex align-center gap-2 p-2 text-sm text-secondary">
                <span className="spinner inline-block">⏳</span>
                <span>Gemini AI is analyzing telemetry & crafting response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Thumbnail Preview */}
        {selectedImage && (
          <div className="p-2 border-t flex align-center gap-2 bg-surface">
            <img
              src={selectedImage}
              alt="Preview"
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <span className="text-xs text-secondary flex-1">Image attached for Gemini Vision Analysis</span>
            <button
              className="btn btn-secondary text-xs p-1"
              onClick={() => setSelectedImage(null)}
            >
              ✕ Remove
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-row p-3 border-t flex align-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          <button
            type="button"
            className="btn btn-secondary p-2 text-xs"
            onClick={() => fileInputRef.current?.click()}
            title="Attach meal photo or gym form photo for AI Vision Analysis"
          >
            📷 Photo
          </button>

          <button
            type="button"
            className={`btn p-2 text-xs ${isListening ? 'btn-danger animate-pulse' : 'btn-secondary'}`}
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Speak to AI Coach (Voice Recognition)'}
          >
            {isListening ? '🎙️ Listening...' : '🎤 Voice'}
          </button>

          <input
            type="text"
            className="input-field flex-1"
            placeholder={
              isListening
                ? 'Speak now...'
                : 'Ask your AI coach about workouts, diet, sleep, or upload a photo...'
            }
            value={input}
            disabled={isGenerating}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />

          <button
            className="btn btn-primary flex align-center gap-1"
            disabled={isGenerating || (!input.trim() && !selectedImage)}
            onClick={() => handleSend()}
          >
            {isGenerating ? 'Thinking...' : 'Send ➔'}
          </button>
        </div>

        {errorMsg && (
          <div className="text-xs text-danger m-2 p-2 bg-danger-light border-radius">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

