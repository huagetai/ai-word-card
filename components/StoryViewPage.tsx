import React from 'react';
import { Story } from '../types';
import { ArrowLeftIcon } from './icons/Icons';
import { t } from '../services/storageService';

interface StoryViewPageProps {
  story: Story;
  onNavigateBack: () => void;
}

const StoryViewPage: React.FC<StoryViewPageProps> = ({ story, onNavigateBack }) => {

  const formatContent = (content: string) => {
    // Replace markdown bold with styled strong tags
    const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent font-bold">$1</strong>');
    // Replace newlines with <br> tags for paragraph breaks
    return formatted.replace(/\n/g, '<br />');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex items-center">
        <button onClick={onNavigateBack} className="flex items-center gap-2 text-accent hover:underline">
          <ArrowLeftIcon /> {t('back_to_home')}
        </button>
      </header>

      <div className="bg-secondary p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-light mb-4 text-center">{story.title}</h1>
        <p className="text-sm text-center text-slate-400 mb-8">
          {t('story_generated_from', { count: story.words.length, date: new Date(story.createdAt).toLocaleString() })}
        </p>
        <div 
          className="text-light text-lg leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: formatContent(story.content) }}
        />
      </div>
    </div>
  );
};

export default StoryViewPage;