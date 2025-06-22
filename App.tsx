import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, QuestionData, GamePhase, GameSettings, PlayerSetupData } from './types';
import { generateTriviaQuestions } from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import Loader from './components/Loader';
import { 
  BG_DARK_MAIN, 
  TEXT_NEON_RED 
} from './constants';

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.SETUP);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerTimeoutId, setAnswerTimeoutId] = useState<number | null>(null);

  const gamePhaseRef = useRef(gamePhase);
  const answerTimeoutIdRef = useRef(answerTimeoutId);
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);

  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    answerTimeoutIdRef.current = answerTimeoutId;
  }, [answerTimeoutId]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    const idToClear = answerTimeoutIdRef.current; 
    return () => {
      if (idToClear) {
        clearTimeout(idToClear);
      }
    };
  }, [answerTimeoutId]);

  const resetGame = useCallback(() => {
    if (answerTimeoutIdRef.current) {
      clearTimeout(answerTimeoutIdRef.current);
      setAnswerTimeoutId(null); 
      answerTimeoutIdRef.current = null;
    }
    setGameSettings(null);
    setPlayers([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setError(null);
    setSelectedAnswer(null);
    setGamePhase(GamePhase.SETUP);
    gamePhaseRef.current = GamePhase.SETUP;
  }, []); 

  const handleStartGameSetup = useCallback((settings: GameSettings, playersData: PlayerSetupData[]) => {
    if (answerTimeoutIdRef.current) {
      clearTimeout(answerTimeoutIdRef.current);
      setAnswerTimeoutId(null);
      answerTimeoutIdRef.current = null;
    }
    setGameSettings(settings);
    setPlayers(playersData.map(pd => ({ ...pd, score: 0 })));
    setCurrentQuestionIndex(0);
    setError(null);
    setSelectedAnswer(null);
    setGamePhase(GamePhase.LOADING_QUESTIONS);
    gamePhaseRef.current = GamePhase.LOADING_QUESTIONS;
  }, []); 

  const handleEndGameEarly = useCallback(() => {
    console.log("[App.tsx] handleEndGameEarly called.");
    if (answerTimeoutIdRef.current) {
        clearTimeout(answerTimeoutIdRef.current);
        setAnswerTimeoutId(null); // Crucial: Update state
        answerTimeoutIdRef.current = null; // Crucial: Sync ref
        console.log('[App.tsx] Cleared pending answer timeout during handleEndGameEarly.');
    }
    setGamePhase(GamePhase.RESULTS);
    gamePhaseRef.current = GamePhase.RESULTS; // Sync ref
    console.log('[App.tsx] handleEndGameEarly finished. New phase is:', GamePhase.RESULTS);
  }, []);


  const fetchQuestions = useCallback(async () => {
    if (!gameSettings || gameSettings.topics.length === 0) { 
      setError("No se han configurado los temas del juego.");
      setGamePhase(GamePhase.SETUP);
      gamePhaseRef.current = GamePhase.SETUP;
      return;
    }
    setError(null);
    try {
      const totalQuestionsToFetch = gameSettings.numPlayers * gameSettings.numRounds;
      const fetchedQuestions = await generateTriviaQuestions(
        gameSettings.topics, 
        totalQuestionsToFetch,
        gameSettings.difficulty
      );
      
      if (fetchedQuestions.length === 0) {
        setError("No se pudieron generar preguntas para esta configuración. Intenta con otros temas o ajustes.");
        setGamePhase(GamePhase.SETUP);
        gamePhaseRef.current = GamePhase.SETUP;
        return;
      }
       if (fetchedQuestions.length < totalQuestionsToFetch) {
        console.warn(`Se esperaban ${totalQuestionsToFetch} preguntas pero se recibieron ${fetchedQuestions.length}. El juego continuará con las preguntas disponibles.`);
      }
      setQuestions(fetchedQuestions);
      setGamePhase(GamePhase.PLAYING);
      gamePhaseRef.current = GamePhase.PLAYING;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Un error desconocido ocurrió al buscar preguntas.");
      setGamePhase(GamePhase.SETUP);
      gamePhaseRef.current = GamePhase.SETUP;
    }
  }, [gameSettings]); 

  useEffect(() => {
    if (gamePhase === GamePhase.LOADING_QUESTIONS) {
      fetchQuestions();
    }
  }, [gamePhase, fetchQuestions]);

  const handleAnswer = useCallback((answer: string) => {
    if (!gameSettings) return;

    if (answerTimeoutIdRef.current) {
        clearTimeout(answerTimeoutIdRef.current);
        // No need to setAnswerTimeoutId(null) here, as a new one is set below
    }

    setSelectedAnswer(answer);
    setGamePhase(GamePhase.SHOWING_ANSWER);
    gamePhaseRef.current = GamePhase.SHOWING_ANSWER;

    const currentQuestion = questionsRef.current[currentQuestionIndexRef.current];
    const currentPlayerIndex = currentQuestionIndexRef.current % gameSettings.numPlayers;
    
    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      setPlayers(prevPlayers => {
        const updatedPlayers = [...prevPlayers];
        if(updatedPlayers[currentPlayerIndex]) {
            updatedPlayers[currentPlayerIndex] = {
                ...updatedPlayers[currentPlayerIndex],
                 score: updatedPlayers[currentPlayerIndex].score + 10
            };
        }
        return updatedPlayers;
      });
    }

    const newTimeoutId = window.setTimeout(() => {
      // CRITICAL CHECK: Only proceed if this timeout is still the active one
      if (answerTimeoutIdRef.current !== newTimeoutId) {
        console.log('[App.tsx] handleAnswer timeout (ID:',newTimeoutId,') aborted, current active ID is', answerTimeoutIdRef.current ,'. GamePhaseRef:', gamePhaseRef.current);
        return;
      }
      
      if (gamePhaseRef.current === GamePhase.SHOWING_ANSWER) { 
          if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setGamePhase(GamePhase.PLAYING);
            gamePhaseRef.current = GamePhase.PLAYING; 
            setSelectedAnswer(null); 
          } else {
            setGamePhase(GamePhase.RESULTS);
            gamePhaseRef.current = GamePhase.RESULTS; 
          }
      }
      setAnswerTimeoutId(null); 
      answerTimeoutIdRef.current = null;
    }, 2500);

    setAnswerTimeoutId(newTimeoutId);
    answerTimeoutIdRef.current = newTimeoutId;
  }, [gameSettings]);


  const renderContent = () => {
    switch (gamePhase) {
      case GamePhase.SETUP:
        return <SetupScreen onStartGameSetup={handleStartGameSetup} />;
      case GamePhase.LOADING_QUESTIONS:
        return <Loader message="El duelo está por empezar..." />;
      case GamePhase.PLAYING:
      case GamePhase.SHOWING_ANSWER:
        if (questions.length === 0 || !gameSettings) return <Loader message="Preparando juego..." />;
        return (
          <GameScreen
            players={players}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            isAnswerRevealed={gamePhase === GamePhase.SHOWING_ANSWER}
            selectedAnswer={selectedAnswer}
            topics={gameSettings.topics}
            totalGameQuestions={questions.length}
            onEndGameEarly={handleEndGameEarly} 
          />
        );
      case GamePhase.RESULTS:
        if (!gameSettings) {
          console.warn("[App.tsx] Rendering ResultsScreen but gameSettings is null. This might indicate an issue. Forcing reset to SETUP.");
          resetGame(); // Force a reset if this inconsistent state is reached
          return <Loader message="Reiniciando..." />;
        }
        return <ResultsScreen players={players} onPlayAgain={resetGame} topics={gameSettings.topics || []} />;
      default:
        return <SetupScreen onStartGameSetup={handleStartGameSetup} />;
    }
  };

  return (
    <div className={`min-h-screen ${BG_DARK_MAIN} flex flex-col items-center justify-center selection:bg-pink-500 selection:text-white`}>
      {error && (
        <div 
          role="alert"
          className={`p-4 ${TEXT_NEON_RED} bg-red-900/50 border border-red-500 rounded-md fixed top-4 left-1/2 -translate-x-1/2 z-50 shadow-lg text-center max-w-md`}
        >
          <p className="font-bold">Error en la Aplicación</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 text-sm text-slate-300 hover:text-white underline"
          >
            Descartar
          </button>
        </div>
      )}
      <main className="w-full">
         {renderContent()}
      </main>
    </div>
  );
};

export default App;