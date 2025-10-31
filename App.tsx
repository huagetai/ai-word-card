import React, { useState, useCallback, useEffect } from 'react';
import { CardDeck, WordCard, Story } from './types';
import HomePage from './components/HomePage';
import CreationPage from './components/CreationPage';
import EditDeckPage from './components/EditDeckPage';
import EditWordsPage from './components/EditWordsPage';
import StudyPage from './components/StudyPage';
import StoryViewPage from './components/StoryViewPage';
import SettingsPage from './components/SettingsPage';
import { saveDecks, getDecks, saveWords, getWords, getUILanguage, onUILanguageChange, offUILanguageChange, UILanguage } from './services/storageService';

export type View = 'home' | 'create' | 'editDeck' | 'editWords' | 'study' | 'storyView' | 'settings';

export interface EditingDeck {
  deck: CardDeck;
  isNew: boolean;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [editingDeck, setEditingDeck] = useState<EditingDeck | null>(null);
  const [editingWords, setEditingWords] = useState<WordCard[] | null>(null);
  const [studyingDeck, setStudyingDeck] = useState<CardDeck | null>(null);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [uiLang, setUiLang] = useState<UILanguage>(getUILanguage());

  useEffect(() => {
    const handleLangChange = (newLang: UILanguage) => {
      setUiLang(newLang);
    };
    onUILanguageChange(handleLangChange);
    return () => offUILanguageChange(handleLangChange);
  }, []);


  const navigateTo = (newView: View) => {
    setView(newView);
  };

  const handleCreate = useCallback(() => {
    navigateTo('create');
  }, []);

  const handleEditDeck = useCallback((deck: CardDeck, isNew: boolean) => {
    setEditingDeck({ deck, isNew });
    navigateTo('editDeck');
  }, []);

  const handleEditWords = useCallback((words: WordCard[]) => {
    setEditingWords(words);
    navigateTo('editWords');
  }, []);

  const handleEditWord = useCallback((word: WordCard) => {
    handleEditWords([word]);
  }, [handleEditWords]);

  const handleStudyDeck = useCallback((deck: CardDeck) => {
    setStudyingDeck(deck);
    navigateTo('study');
  }, []);

  const handleViewStory = useCallback((story: Story) => {
    setViewingStory(story);
    navigateTo('storyView');
  }, []);
  
  const handleNavigateToSettings = useCallback(() => {
    navigateTo('settings');
  }, []);


  const handleSaveDeck = useCallback((deckToSave: CardDeck) => {
    const decks = getDecks();
    const existingIndex = decks.findIndex(d => d.id === deckToSave.id);
    if (existingIndex > -1) {
      decks[existingIndex] = deckToSave;
    } else {
      decks.unshift(deckToSave);
    }
    saveDecks(decks);
    navigateTo('home');
    setEditingDeck(null);
  }, []);
  
  const handleSaveWords = useCallback((wordsToSave: WordCard[]) => {
    // Save/update the words in the main word list
    const existingWords = getWords();
    const wordsToSaveIds = new Set(wordsToSave.map(w => w.id));
    const otherWords = existingWords.filter(w => !wordsToSaveIds.has(w.id));
    const finalWords = [...wordsToSave, ...otherWords];
    saveWords(finalWords);

    // Also update these words if they exist inside any decks
    const allDecks = getDecks();
    const wordsToSaveMap = new Map(wordsToSave.map(w => [w.id, w]));
    const updatedDecks = allDecks.map(deck => {
        let deckHasChanged = false;
        const updatedCards = deck.cards.map(card => {
            if (wordsToSaveMap.has(card.id)) {
                deckHasChanged = true;
                return wordsToSaveMap.get(card.id)!;
            }
            return card;
        });

        if (deckHasChanged) {
            return { ...deck, cards: updatedCards };
        }
        return deck;
    });
    saveDecks(updatedDecks);

    navigateTo('home');
    setEditingWords(null);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'create':
        return <CreationPage onNavigateBack={() => navigateTo('home')} onDeckGenerated={handleEditDeck} onWordsGenerated={handleEditWords} />;
      case 'editDeck':
        if (editingDeck) {
          return <EditDeckPage initialDeck={editingDeck.deck} onSave={handleSaveDeck} onCancel={() => navigateTo('home')} />;
        }
        return null;
      case 'editWords':
        if (editingWords) {
            return <EditWordsPage initialWords={editingWords} onSave={handleSaveWords} onCancel={() => navigateTo('home')} />;
        }
        return null;
      case 'study':
        if (studyingDeck) {
          return <StudyPage deck={studyingDeck} onEndSession={() => { setStudyingDeck(null); navigateTo('home'); }} />;
        }
        return null;
      case 'storyView':
        if (viewingStory) {
          return <StoryViewPage story={viewingStory} onNavigateBack={() => { setViewingStory(null); navigateTo('home'); }} />;
        }
        return null;
      case 'settings':
        return <SettingsPage onNavigateBack={() => navigateTo('home')} />;
      case 'home':
      default:
        return <HomePage onCreate={handleCreate} onEditDeck={(deck) => handleEditDeck(deck, false)} onEditWord={handleEditWord} onStudyDeck={handleStudyDeck} onViewStory={handleViewStory} onNavigateToSettings={handleNavigateToSettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary font-sans" key={uiLang}>
      <div className="container mx-auto p-4 md:p-8">
        {renderView()}
      </div>
    </div>
  );
};

export default App;