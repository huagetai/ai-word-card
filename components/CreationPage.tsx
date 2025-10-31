import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CardDeck, WordCard } from '../types';
import { processAndGenerateWords, recognizeWordsInImage, generateWordList } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, ImageIcon } from './icons/Icons';
import { t, getNativeLanguage, getTargetLanguage, ContentLanguage } from '../services/storageService';


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
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [wordListPrompt, setWordListPrompt] = useState<string>('');
  const [isGeneratingWords, setIsGeneratingWords] = useState<boolean>(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPrompt('');
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    setIsRecognizing(true);
    setError(null);
    try {
      const words = await recognizeWordsInImage(file);
      if (words.length > 0) {
        setPrompt(words.join(',\n'));
      } else {
        setError(t('image_recognition_failed'));
      }
    } catch (err: any) {
      setError(err.message || t('image_processing_failed'));
    } finally {
      setIsRecognizing(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleGenerateWordList = async () => {
    if (!wordListPrompt || isGeneratingWords) return;

    setIsGeneratingWords(true);
    setError(null);
    try {
        const targetLanguage = getTargetLanguage();
        const nativeLanguage = getNativeLanguage();
        const words = await generateWordList(wordListPrompt, targetLanguage, nativeLanguage);
        
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

      if (mode === 'deck') {
        const newDeck: CardDeck = {
          id: uuidv4(),
          title: deckTitle,
          cards: generatedCards,
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
        <div>
          <label className="text-lg font-semibold text-dark-text block mb-2">{t('source_image_optional')}</label>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecognizing || isLoading}
            className="w-full flex justify-center items-center gap-3 py-3 px-6 bg-primary text-light border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon />
            {isRecognizing ? t('recognizing') : t('upload_image_prompt')}
          </button>

          {isRecognizing && <div className="text-center mt-2 text-accent">{t('processing_image')}</div>}

          {imagePreview && (
              <div className="mt-4 relative">
                  <img src={imagePreview} alt="Uploaded preview" className="w-full max-h-60 object-contain rounded-lg bg-primary" />
                  <button 
                    onClick={() => {setImagePreview(null); setPrompt('')}}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full h-7 w-7 flex items-center justify-center text-lg hover:bg-black/80 transition-colors"
                    aria-label={t('remove_image')}
                  >
                      &times;
                  </button>
              </div>
          )}
        </div>
        
        <div className="bg-primary p-4 rounded-lg border border-slate-600">
          <label className="text-lg font-semibold text-dark-text block mb-2">{t('ai_assistant_for_words')}</label>
          <div className="flex flex-col sm:flex-row gap-2">
              <input
                  type="text"
                  value={wordListPrompt}
                  onChange={(e) => setWordListPrompt(e.target.value)}
                  placeholder={t('word_list_prompt_placeholder')}
                  className="flex-grow p-2 bg-slate-700 border border-slate-500 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
                  disabled={isLoading || isGeneratingWords}
              />
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