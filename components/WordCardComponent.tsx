
import React, { useState } from 'react';
import { WordCard } from '../types';
import { VolumeUpIcon, RefreshIcon } from './icons/Icons';
import { generateFlashcardDataForWord } from '../services/geminiService';
import { t, ContentLanguage } from '../services/storageService';

interface WordCardComponentProps {
  card: WordCard;
  isEditable?: boolean;
  onUpdate?: (card: WordCard) => void;
}

const WordCardComponent: React.FC<WordCardComponentProps> = ({ card, isEditable = false, onUpdate }) => {
    
  const [isRegenerating, setIsRegenerating] = useState(false);

  const playAudio = () => {
    if (card.audioPronunciation) {
      const audio = new Audio(card.audioPronunciation);
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };
  
  const handleRegenerate = async () => {
    if (!onUpdate || !window.confirm(t('regenerate_card_confirm', { word: card.word }))) {
        return;
    }
    setIsRegenerating(true);
    try {
        const newData = await generateFlashcardDataForWord(card.word, card.targetLanguage as ContentLanguage, card.nativeLanguage as ContentLanguage);
        onUpdate({ ...card, ...newData }); // Keep original id, but replace all other data
    } catch(error) {
        console.error("Failed to regenerate card:", error);
        alert(t('regenerate_failed', { word: card.word }));
    } finally {
        setIsRegenerating(false);
    }
  };

  const handleFieldChange = <K extends keyof WordCard>(field: K, value: WordCard[K]) => {
    if(onUpdate) {
        onUpdate({ ...card, [field]: value });
    }
  };
  
  const handleDefinitionChange = (index: number, field: 'definition' | 'example' | 'nativeDefinition' | 'exampleTranslation', value: string) => {
      if(onUpdate) {
          const newDefinitions = [...card.definitions];
          newDefinitions[index] = { ...newDefinitions[index], [field]: value };
          handleFieldChange('definitions', newDefinitions);
      }
  };
  
  // Helper for complex array fields in editable mode
  const collocationsToString = (cols: { phrase: string; translation: string }[]) => cols.map(c => `${c.phrase} | ${c.translation}`).join('\n');
  const stringToCollocations = (str: string) => str.split('\n').map(line => {
      const parts = line.split('|');
      return { phrase: parts[0]?.trim() || '', translation: parts[1]?.trim() || '' };
    }).filter(c => c.phrase);
  
  const wordFamilyToString = (family: { word: string; partOfSpeech: string; nativeTranslation: string }[]) => family.map(f => `${f.word} (${f.partOfSpeech}) | ${f.nativeTranslation}`).join('\n');
  const stringToWordFamily = (str: string) => str.split('\n').map(line => {
      const mainParts = line.split('|');
      const wordAndPos = mainParts[0]?.trim() || '';
      const match = wordAndPos.match(/(.+)\s\((.+)\)/);
      return { 
          word: match ? match[1].trim() : wordAndPos,
          partOfSpeech: match ? match[2].trim() : '',
          nativeTranslation: mainParts[1]?.trim() || '' 
      };
  }).filter(f => f.word);

  const mnemonicsToString = (mnemonics: { type: string; targetLanguage: string; nativeLanguage: string }[]) => 
    mnemonics.map(m => `[${m.type}] ${m.targetLanguage} | ${m.nativeLanguage}`).join('\n---\n');
  
  const stringToMnemonics = (str: string) => str.split('\n---\n').map(block => {
      const match = block.match(/^\[(.*?)\]\s*(.*?)\s*\|\s*(.*)$/s);
      if (match) {
        return { type: match[1]?.trim() || '', targetLanguage: match[2]?.trim() || '', nativeLanguage: match[3]?.trim() || '' };
      }
      const parts = block.split('|');
      return { type: 'Custom', targetLanguage: parts[0]?.trim() || '', nativeLanguage: parts[1]?.trim() || '' };
    }).filter(m => m.targetLanguage || m.nativeLanguage);


  const EditableField: React.FC<{value: string, onChange: (value: string) => void, tag?: 'input' | 'textarea', placeholder?: string}> = ({ value, onChange, tag = 'input', placeholder }) => {
    const commonClasses = "w-full bg-slate-700 p-1 rounded-md text-light focus:ring-1 focus:ring-accent focus:outline-none";
    if (tag === 'textarea') {
      return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${commonClasses} min-h-24 resize-y`} />;
    }
    return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={commonClasses} />;
  };

  const CardSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold text-accent mb-2">{title}</h4>
        <div className="text-dark-text space-y-2 text-sm md:text-base">{children}</div>
    </div>
  );

  return (
    <div className="bg-secondary p-6 rounded-xl shadow-lg border border-slate-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-bold text-light tracking-wide">{card.word}</h2>
          {card.audioPronunciation && (
            <button onClick={playAudio} className="text-accent hover:text-sky-300 transition-colors">
              <VolumeUpIcon />
            </button>
          )}
          {isEditable && (
             <button onClick={handleRegenerate} disabled={isRegenerating} className="p-2 text-dark-text hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-wait" title="重新生成此单词卡">
                {isRegenerating ? <RefreshIcon className="animate-spin" /> : <RefreshIcon />}
             </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-x-4 gap-y-1 text-dark-text">
            <span>{card.partOfSpeech.abbreviation} ({card.partOfSpeech.nativeName})</span>
            <span className="text-slate-500">UK: {card.phonetics.uk}</span>
            <span className="text-slate-500">US: {card.phonetics.us}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <CardSection title={t('definitions_examples')}>
            {card.definitions.map((def, index) => (
                <div key={index} className="pl-3 border-l-2 border-slate-600 space-y-1">
                    {isEditable ? 
                        <EditableField value={def.definition} onChange={(val) => handleDefinitionChange(index, 'definition', val)} tag="textarea"/> : 
                        <p>{def.definition}</p>
                    }
                    {isEditable ? 
                        <EditableField value={def.nativeDefinition} onChange={(val) => handleDefinitionChange(index, 'nativeDefinition', val)} /> :
                        <p className="text-sky-300/80">{def.nativeDefinition}</p>
                    }
                    {isEditable ?
                        <EditableField value={`"${def.example}"`} onChange={(val) => handleDefinitionChange(index, 'example', val.replace(/"/g, ''))}/> :
                        <p className="text-slate-400 italic mt-1">"{def.example}"</p>
                    }
                    {isEditable ?
                        <EditableField value={def.exampleTranslation} onChange={(val) => handleDefinitionChange(index, 'exampleTranslation', val)} placeholder="Example translation"/> :
                        (def.exampleTranslation && <p className="text-sky-300/80 text-sm italic">{def.exampleTranslation}</p>)
                    }
                </div>
            ))}
          </CardSection>
        </div>

        <div className="space-y-4">
           <CardSection title={t('collocations')}>
                {isEditable ? 
                    <EditableField value={collocationsToString(card.collocations)} onChange={val => handleFieldChange('collocations', stringToCollocations(val))} tag="textarea" placeholder="phrase | translation"/> :
                    card.collocations.map((col, i) => <p key={i}>{col.phrase} - <span className="text-sky-300/80">{col.translation}</span></p>)
                }
           </CardSection>
           <CardSection title={t('word_family')}>
                {isEditable ?
                    <EditableField value={wordFamilyToString(card.wordFamily)} onChange={val => handleFieldChange('wordFamily', stringToWordFamily(val))} tag="textarea" placeholder="word (pos) | translation"/> :
                    card.wordFamily.map((wf, i) => <p key={i}>{wf.word} ({wf.partOfSpeech}) - <span className="text-sky-300/80">{wf.nativeTranslation}</span></p>)
                }
           </CardSection>
        </div>

        <div className="space-y-4">
          <CardSection title={t('synonyms')}>
            {isEditable ? 
                <EditableField value={card.synonyms.join(', ')} onChange={val => handleFieldChange('synonyms', val.split(',').map(s=>s.trim()))} /> :
                <p>{card.synonyms.join(', ')}</p>
            }
          </CardSection>
          <CardSection title={t('antonyms')}>
             {isEditable ? 
                <EditableField value={card.antonyms.join(', ')} onChange={val => handleFieldChange('antonyms', val.split(',').map(s=>s.trim()))} /> :
                <p>{card.antonyms.join(', ')}</p>
            }
          </CardSection>
        </div>
        
        <div className="md:col-span-2 lg:col-span-3">
             <CardSection title={t('mnemonics')}>
                 {isEditable ?
                    <EditableField 
                        value={mnemonicsToString(card.mnemonic)} 
                        onChange={val => handleFieldChange('mnemonic', stringToMnemonics(val))} 
                        tag="textarea" 
                        placeholder="[type] target language | native language (use '---' to separate)"
                    /> :
                    card.mnemonic.map((m, i) => (
                        <div key={i} className="mb-3 last:mb-0 pl-3 border-l-2 border-slate-600">
                            <p className="font-semibold text-slate-300">{m.type}</p>
                            {m.targetLanguage && <p className="italic">"{m.targetLanguage}"</p>}
                            <p className="italic text-sky-300/80">{m.nativeLanguage}</p>
                        </div>
                    ))
                 }
             </CardSection>
        </div>
      </div>
    </div>
  );
};

export default WordCardComponent;