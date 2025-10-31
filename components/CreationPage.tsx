import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CardDeck, WordCard } from '../types';
import { processAndGenerateWords, generateWordList } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, ImageIcon } from './icons/Icons';
import { t, getNativeLanguage, getTargetLanguage, ContentLanguage, getWords, saveWords } from '../services/storageService';


interface CreationPageProps {
  onNavigateBack: () => void;
  onDeckGenerated: (deck: CardDeck, isNew: boolean) => void;
  onWordsGenerated: (words: WordCard[]) => void;
}

type CreationMode = 'deck' | 'words';

const CreationPage: React.FC<CreationPageProps> = ({ onNavigateBack, onDeckGenerated, onWordsGenerated }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<CreationMode>('deck');
  const [deckTitle, setDeckTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [wordListPrompt, setWordListPrompt] = useState<string>('');
  const [isGeneratingWords, setIsGeneratingWords] = useState<boolean>(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Reset file input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleGenerateWordList = async () => {
    if (!wordListPrompt || isGeneratingWords) return;

    setIsGeneratingWords(true);
    setError(null);
    try {
        const targetLanguage = getTargetLanguage();
        const nativeLanguage = getNativeLanguage();
        const words = await generateWordList(wordListPrompt, imageFile, targetLanguage, nativeLanguage);
        
        if (words.length > 0) {
            setPrompt(prev => {
                const existingWords = prev.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
                const newWords = words.filter(w => !existingWords.includes(w)); // Avoid duplicates
                if (prev.trim() && newWords.length > 0) {
                    return prev + ',\n' + newWords.join(',\n');
                }
                return newWords.join(',\n');
            });
            setWordListPrompt('');
        }
    } catch (err: any) {
        setError(err.message || t('word_generation_failed'));
    } finally {
        setIsGeneratingWords(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    const words = prompt.split(/[\n,]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
    if (words.length === 0) {
      setError(t('error_at_least_one_word'));
      return;
    }
    if (mode === 'deck' && !deckTitle) {
      setError(t('error_deck_title_required'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(t('starting_generation'));

    try {
      const targetLanguage = getTargetLanguage();
      const nativeLanguage = getNativeLanguage();
      const generatedCards = await processAndGenerateWords(words, targetLanguage, nativeLanguage, setProgress);
      
      // Save newly generated/retrieved words to the master list
      const existingWords = getWords();
      const generatedCardsMap = new Map(generatedCards.map(c => [c.id, c]));
      const existingWordsFiltered = existingWords.filter(w => !generatedCardsMap.has(w.id));
      saveWords([...existingWordsFiltered, ...generatedCards]);

      if (mode === 'deck') {
        const newDeck: CardDeck = {
          id: uuidv4(),
          title: deckTitle,
          cards: generatedCards.map(c => c.id), // Store only IDs
          createdAt: new Date().toISOString(),
          targetLanguage,
          nativeLanguage,
        };
        onDeckGenerated(newDeck, true);
      } else {
        onWordsGenerated(generatedCards);
      }

    } catch (err: any) {
      setError(err.message || t('unknown_error'));
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  }, [prompt, mode, deckTitle, onDeckGenerated, onWordsGenerated]);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onNavigateBack} className="flex items-center gap-2 text-accent mb-6 hover:underline">
        <ArrowLeftIcon /> {t('back_to_home')}
      </button>
      <h1 className="text-4xl font-bold mb-8">{t('create_new_word_cards')}</h1>

      <div className="space-y-6 bg-secondary p-8 rounded-xl shadow-lg">
        <div className="bg-primary p-4 rounded-lg border border-slate-600">
          <label className="text-lg font-semibold text-dark-text block mb-2">{t('ai_assistant_for_words')}</label>
          
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" disabled={isLoading} />
          
          <div className="mb-4">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="AI assistant context" className="w-full max-h-48 object-contain rounded-lg bg-black/20" />
                <button 
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full h-7 w-7 flex items-center justify-center text-lg hover:bg-black/80 transition-colors"
                  aria-label={t('remove_image')}
                  disabled={isLoading}
                >
                  &times;
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-3 px-6 bg-slate-700 text-light border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon />
                {t('ai_upload_image_context')}
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <SparklesIcon />
                </div>
                <input
                    type="text"
                    value={wordListPrompt}
                    onChange={(e) => setWordListPrompt(e.target.value)}
                    placeholder={t('word_list_prompt_placeholder')}
                    className="w-full p-2 pl-10 bg-slate-700 border border-slate-500 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
                    disabled={isLoading || isGeneratingWords}
                />
              </div>
              <button
                  onClick={handleGenerateWordList}
                  disabled={isLoading || isGeneratingWords || !wordListPrompt}
                  className="flex justify-center items-center gap-2 py-2 px-4 bg-sky-600 text-light font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed shrink-0"
              >
                  {isGeneratingWords ? (
                      <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-light"></div>
                          {t('generating_words')}
                      </>
                  ) : (
                      <>
                          <SparklesIcon />
                          {t('generate_word_list')}
                      </>
                  )}
              </button>
          </div>
        </div>

        <div>
          <label className="text-lg font-semibold text-dark-text block mb-2">{t('words_to_generate')}</label>
          <p className="text-sm text-slate-400 mb-2">{t('words_to_generate_desc_updated')}</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('words_placeholder')}
            className="w-full h-40 p-3 bg-primary border border-slate-600 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-lg font-semibold text-dark-text block mb-2">{t('generation_mode')}</label>
          <div className="flex gap-4">
            <button onClick={() => setMode('deck')} className={`flex-1 py-3 px-4 rounded-lg transition-colors ${mode === 'deck' ? 'bg-accent text-primary font-bold' : 'bg-primary'}`} disabled={isLoading}>
              {t('word_deck')}
            </button>
            <button onClick={() => setMode('words')} className={`flex-1 py-3 px-4 rounded-lg transition-colors ${mode === 'words' ? 'bg-accent text-primary font-bold' : 'bg-primary'}`} disabled={isLoading}>
              {t('independent_words')}
            </button>
          </div>
        </div>

        {mode === 'deck' && (
          <div>
            <label htmlFor="deckTitle" className="text-lg font-semibold text-dark-text block mb-2">{t('deck_title')}</label>
            <input
              id="deckTitle"
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder={t('deck_title_placeholder')}
              className="w-full p-3 bg-primary border border-slate-600 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
              disabled={isLoading}
            />
          </div>
        )}

        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-accent text-primary font-bold text-lg rounded-lg shadow-lg hover:bg-sky-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span>{progress || t('generating')}</span>
            </>
          ) : (
            <>
              <SparklesIcon />
              {t('generate')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreationPage;