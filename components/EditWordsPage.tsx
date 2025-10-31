import React, { useState, useEffect, useRef } from 'react';
import { WordCard } from '../types';
import WordCardComponent from './WordCardComponent';
import { ArrowLeftIcon, SaveIcon } from './icons/Icons';
import { t } from '../services/storageService';

interface EditWordsPageProps {
  initialWords: WordCard[];
  onSave: (words: WordCard[]) => void;
  onCancel: () => void;
}

const DRAFT_KEY = 'draft_edit_words';

interface WordsDraft {
  initialIds: string[];
  words: WordCard[];
}


const EditWordsPage: React.FC<EditWordsPageProps> = ({ initialWords, onSave, onCancel }) => {
  const [words, setWords] = useState<WordCard[]>(initialWords);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Restore draft on mount
  useEffect(() => {
    try {
      const savedDraftJson = localStorage.getItem(DRAFT_KEY);
      if (savedDraftJson) {
        const savedDraft: WordsDraft = JSON.parse(savedDraftJson);
        const currentInitialIds = initialWords.map(w => w.id).sort();
        const draftInitialIds = savedDraft.initialIds.sort();

        if (currentInitialIds.join(',') === draftInitialIds.join(',') && window.confirm(t('unsaved_words_draft_found'))) {
          setWords(savedDraft.words);
        }
      }
    } catch (error) {
      console.error("Failed to restore words draft:", error);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [initialWords]);

  // Auto-save on words changes (debounced)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      try {
        const draft: WordsDraft = {
          initialIds: initialWords.map(w => w.id),
          words: words,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.error("Failed to save words draft:", error);
      }
    }, 1000);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [words, initialWords]);

  const cleanupAndAction = (action: () => void) => {
    localStorage.removeItem(DRAFT_KEY);
    action();
  };


  const handleCardUpdate = (updatedCard: WordCard) => {
    const cardIndex = words.findIndex(c => c.id === updatedCard.id);
    if(cardIndex > -1) {
        const newCards = [...words];
        newCards[cardIndex] = updatedCard;
        setWords(newCards);
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button onClick={() => cleanupAndAction(onCancel)} className="flex items-center gap-2 text-accent hover:underline">
                <ArrowLeftIcon /> {t('return')}
            </button>
            <h1 className="text-3xl font-bold text-center">{t('confirm_and_edit_words')}</h1>
            <button onClick={() => cleanupAndAction(() => onSave(words))} className="flex items-center gap-2 bg-accent hover:bg-sky-400 text-primary font-bold py-2 px-4 rounded-lg transition-colors">
                <SaveIcon /> {t('save_words')}
            </button>
        </div>
      
        <div className="space-y-6">
            {words.map(card => (
                <WordCardComponent key={card.id} card={card} onUpdate={handleCardUpdate} isEditable={true}/>
            ))}
        </div>
    </div>
  );
};

export default EditWordsPage;