import React, { useState } from 'react';
import {
  t, UILanguage, ContentLanguage, setUILanguage, getUILanguage, setNativeLanguage, getNativeLanguage,
  setTargetLanguage, getTargetLanguage, supportedUILanguages, supportedContentLanguages
} from '../services/storageService';
import { ArrowLeftIcon } from './icons/Icons';

// --- LanguageSelector Component (kept internal) ---
const LanguageSelector: React.FC = () => {
    const [uiLang, setUiLangState] = useState(getUILanguage());
    const [nativeLang, setNativeLangState] = useState(getNativeLanguage());
    const [targetLang, setTargetLangState] = useState(getTargetLanguage());

    const handleUiLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as UILanguage;
        setUILanguage(newLang);
        setUiLangState(newLang);
    };

    const handleNativeLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as ContentLanguage;
        setNativeLanguage(newLang);
        setNativeLangState(newLang);
    };

    const handleTargetLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as ContentLanguage;
        setTargetLanguage(newLang);
        setTargetLangState(newLang);
    };
    
    const renderOptions = (options: Record<string, string>) => {
        return Object.entries(options).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label htmlFor="uiLang" className="text-lg text-dark-text">{t('ui_language')}:</label>
                <select id="uiLang" value={uiLang} onChange={handleUiLangChange} className="w-48 bg-primary text-light rounded p-2 border border-slate-600 focus:ring-accent focus:ring-2 focus:outline-none">
                    {renderOptions(supportedUILanguages)}
                </select>
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="nativeLang" className="text-lg text-dark-text">{t('native_language')}:</label>
                <select id="nativeLang" value={nativeLang} onChange={handleNativeLangChange} className="w-48 bg-primary text-light rounded p-2 border border-slate-600 focus:ring-accent focus:ring-2 focus:outline-none">
                    {renderOptions(supportedContentLanguages)}
                </select>
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="targetLang" className="text-lg text-dark-text">{t('target_language')}:</label>
                <select id="targetLang" value={targetLang} onChange={handleTargetLangChange} className="w-48 bg-primary text-light rounded p-2 border border-slate-600 focus:ring-accent focus:ring-2 focus:outline-none">
                    {renderOptions(supportedContentLanguages)}
                </select>
            </div>
        </div>
    );
};
// --- End LanguageSelector ---

interface SettingsPageProps {
    onNavigateBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateBack }) => {
    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={onNavigateBack} className="flex items-center gap-2 text-accent mb-6 hover:underline">
                <ArrowLeftIcon /> {t('back_to_home')}
            </button>
            <h1 className="text-4xl font-bold mb-8">{t('settings')}</h1>

            <div className="space-y-6 bg-secondary p-8 rounded-xl shadow-lg">
                <LanguageSelector />
            </div>
        </div>
    );
};

export default SettingsPage;
