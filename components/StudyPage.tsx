
import React, { useState, useEffect, useMemo } from 'react';
import { CardDeck, WordCard } from '../types';
import WordCardComponent from './WordCardComponent';
import { ArrowLeftIcon } from './icons/Icons';
import { t } from '../services/storageService';

interface StudyPageProps {
  deck: CardDeck;
  onEndSession: () => void;
}

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const StudyPage: React.FC<StudyPageProps> = ({ deck, onEndSession }) => {
  const [sessionQueue, setSessionQueue] = useState<WordCard[]>([]);
  const [learningQueue, setLearningQueue] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (deck.cards.length > 0) {
      setSessionQueue(shuffleArray(deck.cards));
      setSessionComplete(false);
    } else {
      setSessionComplete(true);
    }
  }, [deck]);

  const currentCard = sessionQueue[currentIndex];

  const advanceToNextCard = () => {
    setIsTransitioning(true);
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex + 1 < sessionQueue.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        if (learningQueue.length > 0) {
          setSessionQueue(shuffleArray(learningQueue));
          setLearningQueue([]);
          setCurrentIndex(0);
        } else {
          setSessionComplete(true);
        }
      }
      setIsTransitioning(false);
    }, 300); // Wait for flip back animation
  };

  const handleMarkLearning = () => {
    if (!currentCard || isTransitioning) return;
    setLearningQueue(prev => [...prev, currentCard]);
    advanceToNextCard();
  };

  const handleMarkKnown = () => {
    if (!currentCard || isTransitioning) return;
    advanceToNextCard();
  };
  
  const handleFlip = () => {
      if(isTransitioning) return;
      setIsFlipped(true);
  }

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[80vh]">
        <h1 className="text-4xl font-bold text-accent mb-4">✨ {t('study_complete')} ✨</h1>
        <p className="text-xl text-dark-text mb-8">{t('study_complete_message', { deckTitle: deck.title })}</p>
        <button onClick={onEndSession} className="bg-accent hover:bg-sky-400 text-primary font-bold py-3 px-6 rounded-lg transition-colors text-lg">
          {t('return_to_home')}
        </button>
      </div>
    );
  }

  if (!currentCard) {
     return (
        <div className="flex flex-col items-center justify-center text-center h-[80vh]">
            <h1 className="text-2xl font-bold text-dark-text mb-8">{t('empty_deck_message')}</h1>
            <button onClick={onEndSession} className="flex items-center gap-2 text-accent hover:underline">
                <ArrowLeftIcon /> {t('return')}
            </button>
        </div>
     );
  }

  const progressPercent = (currentIndex / sessionQueue.length) * 100;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onEndSession} className="flex items-center gap-2 text-accent hover:underline">
          <ArrowLeftIcon /> {t('end_session')}
        </button>
        <h1 className="text-2xl font-bold text-center truncate px-2">{deck.title}</h1>
        <div className="text-dark-text font-mono flex-shrink-0">
            {currentIndex + 1} / {sessionQueue.length} 
            {learningQueue.length > 0 && <span className="text-red-400 ml-2">(+{learningQueue.length})</span>}
        </div>
      </div>

      <div className="w-full bg-secondary rounded-full h-2.5">
          <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progressPercent}%`, transition: 'width 0.3s ease-in-out' }}></div>
      </div>
      
      <div className="[perspective:1000px]">
        <div 
          className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''} ${isTransitioning ? 'opacity-50' : ''}`}
          style={{ minHeight: '60vh' }}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] bg-secondary rounded-xl flex items-center justify-center p-6 border border-slate-700">
            <h2 className="text-6xl md:text-8xl font-bold text-light break-all text-center">{currentCard.word}</h2>
          </div>

          {/* Back of card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto rounded-xl">
             <div className="h-full overflow-y-auto">
                <WordCardComponent card={currentCard} isEditable={false} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center pt-4" style={{ minHeight: '100px'}}>
        {!isFlipped ? (
          <button onClick={handleFlip} className="bg-accent text-primary font-bold py-4 px-16 rounded-lg text-xl hover:bg-sky-400 transition-colors shadow-lg disabled:bg-slate-500" disabled={isTransitioning}>
            {t('show_answer')}
          </button>
        ) : (
          <div className="flex gap-4 md:gap-8 w-full">
            <button onClick={handleMarkLearning} disabled={isTransitioning} className="flex-1 bg-rose-600 hover:bg-rose-500 text-light font-bold py-4 px-8 rounded-lg text-xl transition-colors disabled:opacity-50">
              {t('learning')}
            </button>
            <button onClick={handleMarkKnown} disabled={isTransitioning} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-light font-bold py-4 px-8 rounded-lg text-xl transition-colors disabled:opacity-50">
              {t('known')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPage;