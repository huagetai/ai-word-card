import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CardDeck, WordCard } from '../types';
import WordCardComponent from './WordCardComponent';
import { ArrowLeftIcon, SaveIcon, SparklesIcon, MinusCircleIcon } from './icons/Icons';
import { processAndGenerateWords } from '../services/geminiService';
import { t, ContentLanguage, getWords, saveWords } from '../services/storageService';

interface EditDeckPageProps {
  initialDeck: CardDeck;
  onSave: (deck: CardDeck) => void;
  onCancel: () => void;
}

const DRAFT_KEY_PREFIX = 'draft_deck_';

const EditDeckPage: React.FC<EditDeckPageProps> = ({ initialDeck, onSave, onCancel }) => {
  const [deck, setDeck] = useState<CardDeck>(initialDeck);
  const [displayedCards, setDisplayedCards] = useState<WordCard[]>([]);
  const [wordsToAdd, setWordsToAdd] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addProgress, setAddProgress] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const draftKey = `${DRAFT_KEY_PREFIX}${initialDeck.id}`;
  
  const allWordsMap = useMemo(() => new Map(getWords().map(w => [w.id, w])), []);

  useEffect(() => {
    const cardsForDeck = deck.cards
      .map(id => allWordsMap.get(id))
      .filter((c): c is WordCard => c !== undefined);
    setDisplayedCards(cardsForDeck);
  }, [deck.cards, allWordsMap]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const savedDraftJson = localStorage.getItem(draftKey);
      if (savedDraftJson) {
        const parsedDraft: CardDeck = JSON.parse(savedDraftJson);
        if (parsedDraft.id === initialDeck.id && window.confirm(t('unsaved_deck_draft_found'))) {
          setDeck(parsedDraft);
        }
      }
    } catch (error) {
      console.error("Failed to restore deck draft:", error);
      localStorage.removeItem(draftKey); // Clear potentially corrupted draft
    }
  }, [draftKey, initialDeck.id]);

  // Auto-save on deck changes (debounced)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(deck));
      } catch (error) {
        console.error("Failed to save deck draft:", error);
      }
    }, 1000); // Save 1 second after last change

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [deck, draftKey]);

  const handleSaveWrapper = () => {
    localStorage.removeItem(draftKey);
    onSave(deck);
  };

  const handleCancelWrapper = () => {
    localStorage.removeItem(draftKey);
    onCancel();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeck({ ...deck, title: e.target.value });
  };
  
  const handleCardUpdate = (updatedCard: WordCard) => {
    // Update the word in the global word list
    const allWords = getWords();
    const wordIndex = allWords.findIndex(w => w.id === updatedCard.id);
    if (wordIndex !== -1) {
        allWords[wordIndex] = updatedCard;
        saveWords(allWords);
    }
    
    // Update the local state for display
    setDisplayedCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const handleRemoveWordFromDeck = (wordId: string) => {
    setDeck(prev => ({...prev, cards: prev.cards.filter(id => id !== wordId)}));
  };

  const handleAddWords = async () => {
    const words = wordsToAdd.split(/[\n,]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
    if (words.length === 0) {
      setAddError(t('add_error_at_least_one_word'));
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const newCards = await processAndGenerateWords(
          words, 
          deck.targetLanguage as ContentLanguage, 
          deck.nativeLanguage as ContentLanguage, 
          setAddProgress
      );

      // Save new/updated words to the master list
      const existingWords = getWords();
      const newCardsMap = new Map(newCards.map(c => [c.id, c]));
      const updatedWordsList = existingWords.filter(w => !newCardsMap.has(w.id));
      updatedWordsList.push(...newCards);
      saveWords(updatedWordsList);

      // Add new card IDs to the current deck
      const newCardIds = newCards.map(c => c.id);
      setDeck(prevDeck => ({
        ...prevDeck,
        cards: [...new Set([...prevDeck.cards, ...newCardIds])], // Use Set to avoid duplicates
      }));
      setWordsToAdd('');

    } catch (err: any) {
      setAddError(err.message || t('add_word_error'));
    } finally {
      setIsAdding(false);
      setAddProgress('');
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button onClick={handleCancelWrapper} className="flex items-center gap-2 text-accent hover:underline">
                <ArrowLeftIcon /> {t('return')}
            </button>
            <h1 className="text-3xl font-bold text-center">{t('edit_deck')}</h1>
            <button onClick={handleSaveWrapper} className="flex items-center gap-2 bg-accent hover:bg-sky-400 text-primary font-bold py-2 px-4 rounded-lg transition-colors">
                <SaveIcon /> {t('save_deck')}
            </button>
        </div>
      
        <div className="bg-secondary p-6 rounded-xl">
            <label htmlFor="deckTitle" className="text-lg font-semibold text-dark-text">{t('deck_title')}</label>
            <input
                id="deckTitle"
                type="text"
                value={deck.title}
                onChange={handleTitleChange}
                className="w-full mt-2 p-3 bg-primary border border-slate-600 rounded-lg text-light text-2xl font-bold focus:ring-2 focus:ring-accent focus:outline-none"
            />
        </div>

        <div className="bg-secondary p-6 rounded-xl space-y-4">
            <h2 className="text-2xl font-semibold">{t('add_new_words_to_deck')}</h2>
            <textarea
                value={wordsToAdd}
                onChange={(e) => setWordsToAdd(e.target.value)}
                placeholder={t('new_words_placeholder')}
                className="w-full h-24 p-3 bg-primary border border-slate-600 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
                disabled={isAdding}
            />
            {addError && <p className="text-red-400">{addError}</p>}
            <button
                onClick={handleAddWords}
                disabled={isAdding || !wordsToAdd}
                className="w-full flex justify-center items-center gap-3 py-3 px-6 bg-sky-600 text-light font-bold rounded-lg shadow-lg hover:bg-sky-500 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
                {isAdding ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-light"></div>
                        <span>{addProgress || t('adding')}</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        {t('generate_and_add')}
                    </>
                )}
            </button>
        </div>

        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('words_in_deck')} ({displayedCards.length})</h2>
            {displayedCards.map(card => (
                <div key={card.id} className="relative group">
                    <WordCardComponent card={card} onUpdate={handleCardUpdate} isEditable={true}/>
                    <button 
                        onClick={() => handleRemoveWordFromDeck(card.id)}
                        className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        aria-label={`Remove ${card.word} from deck`}
                    >
                        <MinusCircleIcon />
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default EditDeckPage;