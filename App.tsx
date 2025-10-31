import React, { useState, useCallback, useEffect } from 'react';
import { CardDeck, WordCard, Story } from './types';
import HomePage from './components/HomePage';
import CreationPage from './components/CreationPage';
import EditDeckPage from './components/EditDeckPage';
import EditWordsPage from './components/EditWordsPage';
import StudyPage from './components/StudyPage';
import StoryViewPage from './components/StoryViewPage';
import GenerateStoryPage from './components/GenerateStoryPage';
import SettingsPage from './components/SettingsPage';
import { saveDecks, getDecks, saveWords, getWords, getStories, saveStories, getUILanguage, onUILanguageChange, offUILanguageChange, UILanguage } from './services/storageService';

export type View = 'home' | 'create' | 'editDeck' | 'editWords' | 'study' | 'storyView' | 'settings' | 'generateStory';

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
  const [generatingStoryForDeck, setGeneratingStoryForDeck] = useState<CardDeck | null>(null);
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

  const handleNavigateToGenerateStory = useCallback((deck: CardDeck) => {
    setGeneratingStoryForDeck(deck);
    navigateTo('generateStory');
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
    const wordsToSaveMap = new Map(wordsToSave.map(w => [w.id, w]));
    
    // Combine old words (that aren't being updated) with the new/updated words
    const updatedWordsList = existingWords.filter(w => !wordsToSaveMap.has(w.id));
    updatedWordsList.push(...wordsToSave);
    
    saveWords(updatedWordsList);

    navigateTo('home');
    setEditingWords(null);
  }, []);

  const handleSaveStory = useCallback((story: Story) => {
    const stories = getStories();
    stories.unshift(story);
    saveStories(stories);
    setGeneratingStoryForDeck(null);
    navigateTo('home');
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
      case 'generateStory':
        if (generatingStoryForDeck) {
          return <GenerateStoryPage deck={generatingStoryForDeck} onStoryGenerated={handleSaveStory} onCancel={() => { setGeneratingStoryForDeck(null); navigateTo('home'); }} />;
        }
        return null;
      case 'settings':
        return <SettingsPage onNavigateBack={() => navigateTo('home')} />;
      case 'home':
      default:
        return <HomePage onCreate={handleCreate} onEditDeck={(deck) => handleEditDeck(deck, false)} onEditWord={handleEditWord} onStudyDeck={handleStudyDeck} onViewStory={handleViewStory} onNavigateToGenerateStory={handleNavigateToGenerateStory} onNavigateToSettings={handleNavigateToSettings} />;
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