import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CardDeck, WordCard, Story } from '../types';
import { 
  getDecks, saveDecks, getWords, saveWords, getStories, saveStories,
  t, UILanguage, ContentLanguage, setUILanguage, getUILanguage, setNativeLanguage, getNativeLanguage,
  setTargetLanguage, getTargetLanguage, supportedUILanguages, supportedContentLanguages
} from '../services/storageService';
import { generateStoryFromWords } from '../services/geminiService';
import { PlusCircleIcon, PencilIcon, TrashIcon, DownloadIcon, UploadIcon, PlayIcon, SparklesIcon, BookOpenIcon, SettingsIcon } from './icons/Icons';

interface HomePageProps {
  onCreate: () => void;
  onEditDeck: (deck: CardDeck) => void;
  onEditWord: (word: WordCard) => void;
  onStudyDeck: (deck: CardDeck) => void;
  onViewStory: (story: Story) => void;
  onNavigateToSettings: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCreate, onEditDeck, onEditWord, onStudyDeck, onViewStory, onNavigateToSettings }) => {
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [myWords, setMyWords] = useState<WordCard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generatingStoryDeckId, setGeneratingStoryDeckId] = useState<string | null>(null);

  useEffect(() => {
    const allDecks = getDecks();
    const independentWords = getWords();

    // Combine words from decks and independent words
    const deckWords = allDecks.flatMap(deck => deck.cards);
    const combinedWords = [...independentWords, ...deckWords];

    // De-duplicate using word ID to create a unified list
    const uniqueWordsMap = new Map<string, WordCard>();
    combinedWords.forEach(word => {
      uniqueWordsMap.set(word.id, word);
    });
    const allUniqueWords = Array.from(uniqueWordsMap.values());
    
    setDecks(allDecks);
    setStories(getStories());
    setMyWords(allUniqueWords);
  }, []);

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm(t('confirm_deck_delete'))) {
      const updatedDecks = decks.filter(deck => deck.id !== deckId);
      saveDecks(updatedDecks);
      setDecks(updatedDecks);

      const updatedStories = stories.filter(story => story.deckId !== deckId);
      saveStories(updatedStories);
      setStories(updatedStories);
    }
  };

  const handleGenerateStory = async (deck: CardDeck) => {
    if (generatingStoryDeckId) return;
    setGeneratingStoryDeckId(deck.id);
    try {
      const words = deck.cards.map(card => card.word);
      const storyContent = await generateStoryFromWords(deck.title, words, deck.targetLanguage as ContentLanguage, deck.nativeLanguage as ContentLanguage);
      
      const newStory: Story = {
        id: uuidv4(),
        deckId: deck.id,
        title: `${deck.title} - AI Story`,
        content: storyContent,
        words: words,
        createdAt: new Date().toISOString(),
        targetLanguage: deck.targetLanguage,
        nativeLanguage: deck.nativeLanguage,
      };
      
      const updatedStories = [newStory, ...getStories()];
      saveStories(updatedStories);
      setStories(updatedStories);
      
    } catch (error) {
      console.error(error);
      alert((error as Error).message || t('story_generation_failed'));
    } finally {
      setGeneratingStoryDeckId(null);
    }
  };

  const handleDeleteStory = (storyId: string) => {
    if (window.confirm(t('confirm_story_delete'))) {
      const updatedStories = stories.filter(story => story.id !== storyId);
      saveStories(updatedStories);
      setStories(updatedStories);
    }
  };

  const handleExport = () => {
    const data = {
      decks: getDecks(),
      words: getWords(),
      stories: getStories(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not a string");
        const data = JSON.parse(text);

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (window.confirm(t('confirm_import'))) {
            
            const importedDecks = (Array.isArray(data.decks) ? data.decks : []) as CardDeck[];
            const importedWords = (Array.isArray(data.words) ? data.words : []) as WordCard[];
            const importedStories = (Array.isArray(data.stories) ? data.stories : []) as Story[];

            saveDecks(importedDecks);
            saveWords(importedWords);
            saveStories(importedStories);

            setDecks(importedDecks);
            setStories(importedStories);

            const deckWords = importedDecks.flatMap(deck => deck.cards);
            const combinedWords = [...importedWords, ...deckWords];
            const uniqueWordsMap = new Map<string, WordCard>();
            combinedWords.forEach(word => {
                uniqueWordsMap.set(word.id, word);
            });
            setMyWords(Array.from(uniqueWordsMap.values()));

            alert(t('import_success'));
          }
        } else {
          throw new Error(t('invalid_import_file'));
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert(`${t('import_failed')}: ${(error as Error).message}`);
      } finally {
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-bold text-light">{t('intelligent_flashcards')}</h1>
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
            <button onClick={handleImportClick} className="flex items-center gap-2 bg-secondary hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <UploadIcon /> {t('import')}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json" />
            <button onClick={handleExport} className="flex items-center gap-2 bg-secondary hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <DownloadIcon /> {t('export')}
            </button>
            <button onClick={onNavigateToSettings} className="flex items-center justify-center bg-secondary hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-lg transition-colors" aria-label={t('settings')}>
              <SettingsIcon />
            </button>
            <button onClick={onCreate} className="flex items-center gap-2 bg-accent hover:bg-sky-400 text-primary font-bold py-2 px-4 rounded-lg transition-colors shadow-lg">
              <PlusCircleIcon /> {t('create_new_cards')}
            </button>
        </div>
      </header>

      <main>
        <section>
          <h2 className="text-3xl font-semibold mb-6 border-b-2 border-secondary pb-2">{t('my_decks')}</h2>
          {decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map(deck => (
                <div key={deck.id} className="bg-secondary p-6 rounded-xl shadow-lg flex flex-col justify-between hover:scale-105 transition-transform">
                  <div>
                    <h3 className="text-2xl font-bold text-accent">{deck.title}</h3>
                    <p className="text-dark-text mt-2">{deck.cards.length} {t('cards_count')}</p>
                    <p className="text-sm text-slate-500 mt-1">{t('created_at')}: {new Date(deck.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end items-center gap-2 mt-4 flex-wrap">
                    <button
                        onClick={() => onStudyDeck(deck)}
                        className="flex items-center gap-2 bg-accent text-primary font-bold py-2 px-3 rounded-lg hover:bg-sky-400 transition-colors shadow-md text-sm mr-auto disabled:bg-slate-500 disabled:cursor-not-allowed"
                        disabled={deck.cards.length === 0}
                        aria-label={`Study ${deck.title}`}
                    >
                        <PlayIcon />
                        {t('start_learning')}
                    </button>
                     <button
                      onClick={() => handleGenerateStory(deck)}
                      disabled={deck.cards.length < 3 || !!generatingStoryDeckId}
                      className="flex items-center gap-2 bg-slate-600 text-light py-2 px-3 rounded-lg hover:bg-slate-500 transition-colors shadow-md text-sm disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500"
                      aria-label={`Generate story for ${deck.title}`}
                      title={deck.cards.length < 3 ? t('story_deck_size_tooltip') : t('story_generation_tooltip')}
                    >
                      {generatingStoryDeckId === deck.id ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-light"></div> {t('generating')}</>
                      ) : (
                        <><SparklesIcon /> {t('generate_story')}</>
                      )}
                    </button>
                    <button onClick={() => onEditDeck(deck)} className="p-2 text-dark-text hover:text-accent transition-colors" aria-label={`Edit ${deck.title}`}><PencilIcon /></button>
                    <button onClick={() => handleDeleteDeck(deck.id)} className="p-2 text-dark-text hover:text-red-500 transition-colors" aria-label={`Delete ${deck.title}`}><TrashIcon /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-secondary rounded-lg">
              <p className="text-dark-text">{t('no_decks_message')}</p>
              <p className="text-dark-text mt-2">{t('no_decks_prompt')}</p>
            </div>
          )}
        </section>

        <section className="mt-12">
            <h2 className="text-3xl font-semibold mb-6 border-b-2 border-secondary pb-2">{t('my_stories')}</h2>
            {stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map(story => (
                    <div key={story.id} className="bg-secondary p-6 rounded-xl shadow-lg flex flex-col justify-between hover:scale-105 transition-transform">
                        <div>
                            <h3 className="text-xl font-bold text-light">{story.title}</h3>
                            <p className="text-dark-text mt-2">{t('words_count', { count: story.words.length })}</p>
                            <p className="text-sm text-slate-500 mt-1">{t('created_at')}: {new Date(story.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-4">
                            <button
                                onClick={() => onViewStory(story)}
                                className="flex items-center gap-2 bg-accent text-primary font-bold py-2 px-4 rounded-lg hover:bg-sky-400 transition-colors shadow-md text-sm mr-auto"
                                aria-label={`Read ${story.title}`}
                            >
                                <BookOpenIcon />
                                {t('read')}
                            </button>
                            <button onClick={() => handleDeleteStory(story.id)} className="p-2 text-dark-text hover:text-red-500 transition-colors" aria-label={`Delete ${story.title}`}><TrashIcon /></button>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-secondary rounded-lg">
                    <p className="text-dark-text">{t('no_stories_message')}</p>
                    <p className="text-dark-text mt-2">{t('no_stories_prompt')}</p>
                </div>
            )}
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold mb-6 border-b-2 border-secondary pb-2">{t('my_words')}</h2>
          {myWords.length > 0 ? (
            <div className="space-y-4">
              {myWords.map(word => (
                <div key={word.id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-xl font-semibold">{word.word}</span>
                    <span className="text-dark-text ml-4">{word.partOfSpeech.abbreviation} ({word.partOfSpeech.nativeName})</span>
                  </div>
                  <button onClick={() => onEditWord(word)} className="p-2 text-dark-text hover:text-accent transition-colors" aria-label={`Edit ${word.word}`}>
                    <PencilIcon />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-secondary rounded-lg">
              <p className="text-dark-text">{t('no_words_message')}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;