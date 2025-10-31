import React, { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CardDeck, Story, WordCard } from '../types';
import { generateStoryFromWords } from '../services/geminiService';
import { getWords, t, ContentLanguage } from '../services/storageService';
import { ArrowLeftIcon, ImageIcon, SparklesIcon } from './icons/Icons';

interface GenerateStoryPageProps {
  deck: CardDeck;
  onStoryGenerated: (story: Story) => void;
  onCancel: () => void;
}

const GenerateStoryPage: React.FC<GenerateStoryPageProps> = ({ deck, onStoryGenerated, onCancel }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    if (event.target) {
        event.target.value = '';
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allWordsMap = new Map(getWords().map(w => [w.id, w]));
      const wordsForStory = deck.cards
        .map(cardId => allWordsMap.get(cardId))
        .filter((wordCard): wordCard is WordCard => !!wordCard)
        .map(wordCard => wordCard.word);

      const storyContent = await generateStoryFromWords(
        deck.title,
        wordsForStory,
        prompt,
        imageFile,
        deck.targetLanguage as ContentLanguage,
        deck.nativeLanguage as ContentLanguage
      );

      const newStory: Story = {
        id: uuidv4(),
        deckId: deck.id,
        title: `${deck.title} - AI Story`,
        content: storyContent,
        words: wordsForStory,
        createdAt: new Date().toISOString(),
        targetLanguage: deck.targetLanguage,
        nativeLanguage: deck.nativeLanguage,
      };

      onStoryGenerated(newStory);

    } catch (err: any) {
      setError(err.message || t('story_generation_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [deck, prompt, imageFile, onStoryGenerated]);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-2 text-accent mb-6 hover:underline">
        <ArrowLeftIcon /> {t('back_to_home')}
      </button>
      <h1 className="text-4xl font-bold mb-2">{t('generate_new_story')}</h1>
      <p className="text-dark-text mb-8">{t('story_generation_page_title')}: <span className="font-semibold text-light">{deck.title}</span></p>

      <div className="space-y-6 bg-secondary p-8 rounded-xl shadow-lg">
        <div>
          <label htmlFor="storyPrompt" className="text-lg font-semibold text-dark-text block mb-2">{t('story_prompt')}</label>
          <textarea
            id="storyPrompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('story_prompt_placeholder')}
            className="w-full h-24 p-3 bg-primary border border-slate-600 rounded-lg text-light focus:ring-2 focus:ring-accent focus:outline-none"
            disabled={isLoading}
          />
        </div>

        <div>
            <label className="text-lg font-semibold text-dark-text block mb-2">{t('inspiration_image_optional')}</label>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" disabled={isLoading} />
            {imagePreview ? (
                <div className="relative">
                    <img src={imagePreview} alt="Story inspiration" className="w-full max-h-60 object-contain rounded-lg bg-black/20" />
                    <button 
                        onClick={handleRemoveImage}
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
                    {t('upload_inspiration_image')}
                </button>
            )}
        </div>

        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-accent text-primary font-bold text-lg rounded-lg shadow-lg hover:bg-sky-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span>{t('generating')}</span>
            </>
          ) : (
            <>
              <SparklesIcon />
              {t('generate_story')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GenerateStoryPage;
