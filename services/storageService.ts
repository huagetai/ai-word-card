import { CardDeck, WordCard, Story } from '../types';

// --- START OF LANGUAGE SERVICE ---

export type UILanguage = 'en' | 'zh';
export type ContentLanguage = 'en' | 'zh' | 'fr' | 'de' | 'es' | 'ja' | 'ko';

export const supportedUILanguages: Record<UILanguage, string> = {
  en: 'English',
  zh: '简体中文',
};

export const supportedContentLanguages: Record<ContentLanguage, string> = {
  en: 'English',
  zh: 'Chinese (Simplified)',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ja: 'Japanese',
  ko: 'Korean',
};

const translations: Record<UILanguage, Record<string, string>> = {
  zh: {
    "intelligent_flashcards": "智能单词卡",
    "import": "导入",
    "export": "导出",
    "create_new_cards": "创建新卡片",
    "my_decks": "我的卡组",
    "cards_count": "张卡片",
    "created_at": "创建于",
    "start_learning": "开始学习",
    "generate_story": "生成短文",
    "generating": "生成中",
    "story_deck_size_tooltip": "卡组需至少包含3个单词",
    "story_generation_tooltip": "生成辅助短文",
    "no_decks_message": "您还没有创建任何卡组。",
    "no_decks_prompt": "点击“创建新卡片”开始吧！",
    "my_stories": "我的短文",
    "words_count": "个单词",
    "read": "阅读",
    "no_stories_message": "您还没有生成任何短文。",
    "no_stories_prompt": "为一个至少包含3个单词的卡组点击“生成短文”来创建一篇吧！",
    "my_words": "我的单词",
    "no_words_message": "您还没有创建任何单词。",
    "confirm_deck_delete": "您确定要删除这个卡组吗？这也会删除基于该卡组生成的所有短文。",
    "story_generation_failed": "生成短文失败。",
    "confirm_story_delete": "您确定要删除这篇短文吗？",
    "confirm_import": "这将用文件中的内容替换您当前所有的卡组、单词和短文。此操作无法撤销。您确定要继续吗？\n\nThis will replace ALL of your current decks, words, and stories with the content from the file. This action cannot be undone. Are you sure you want to continue?",
    "import_success": "数据导入成功！\nData imported successfully!",
    "invalid_import_file": "文件格式无效。请选择一个有效的JSON备份文件。\nInvalid file format. Please select a valid JSON backup file.",
    "import_failed": "导入失败",
    "ui_language": "界面语言",
    "native_language": "母语",
    "target_language": "目标语言",
    "settings": "设置",
    // Creation Page
    "create_new_word_cards": "创建新单词卡",
    "back_to_home": "返回首页",
    "source_image_optional": "源图片 (可选)",
    "upload_image_prompt": "上传图片以提取单词",
    "recognizing": "识别中...",
    "processing_image": "处理图片中...",
    "image_recognition_failed": "无法从图片中识别出单词。请尝试另一张图片或手动输入。",
    "image_processing_failed": "处理图片失败。",
    "remove_image": "移除图片",
    "ai_assistant_for_words": "AI单词助手",
    "ai_upload_image_context": "上传图片作为上下文",
    "generate_word_list": "生成单词",
    "word_list_prompt_placeholder": "10个关于科技的高级词汇",
    "generating_words": "正在生成单词...",
    "word_generation_failed": "生成单词列表失败。",
    "words_to_generate": "要生成的单词",
    "words_to_generate_desc_updated": "手动输入单词，上传图片，或使用AI助手来填充此列表。",
    "words_placeholder": "例如：\nambitious,\ndiligent,\nserendipity",
    "generation_mode": "生成模式",
    "word_deck": "单词卡组",
    "independent_words": "独立单词",
    "deck_title": "卡组标题",
    "deck_title_placeholder": "例如：'高级词汇'",
    "error_at_least_one_word": "请输入至少一个单词。",
    "error_deck_title_required": "请输入卡组标题。",
    "starting_generation": "开始生成...",
    "unknown_error": "发生未知错误。",
    "generate": "生成",
    // Edit Pages
    "edit_deck": "编辑卡组",
    "return": "返回",
    "save_deck": "保存卡组",
    "add_new_words_to_deck": "添加新单词到卡组",
    "new_words_placeholder": "在此处输入新单词，用逗号或换行符分隔...",
    "add_error_at_least_one_word": "请输入至少一个单词。",
    "add_word_error": "添加单词时发生错误。",
    "generate_and_add": "生成并添加",
    "adding": "正在添加...",
    "words_in_deck": "卡组中的单词卡",
    "confirm_and_edit_words": "确认并编辑单词",
    "save_words": "保存单词",
    "unsaved_deck_draft_found": "发现上次未保存的卡组草稿，要恢复吗？",
    "unsaved_words_draft_found": "发现上次未保存的单词编辑草稿，要恢复吗？",
    // WordCard Component
    "regenerate_card_confirm": "您确定要为 \"{word}\" 重新生成内容吗？当前的所有修改都将被覆盖。",
    "regenerate_failed": "为 \"{word}\" 重新生成失败。",
    "definitions_examples": "释义 & 例句",
    "collocations": "常用搭配",
    "word_family": "词族",
    "synonyms": "同义词",
    "antonyms": "反义词",
    "mnemonics": "助记锦囊",
    // Study Page
    "study_complete": "学习完成！",
    "study_complete_message": "你已经复习了卡组 \"{deckTitle}\" 中的所有卡片。",
    "return_to_home": "返回首页",
    "empty_deck_message": "这个卡组是空的。",
    "end_session": "结束学习",
    "show_answer": "显示答案",
    "learning": "不熟悉",
    "known": "已掌握",
    // Story View
    "story_generated_from": "基于 {count} 个单词生成于 {date}",
  },
  en: {
    "intelligent_flashcards": "Intelligent Flashcards",
    "import": "Import",
    "export": "Export",
    "create_new_cards": "Create New Cards",
    "my_decks": "My Decks",
    "cards_count": "cards",
    "created_at": "Created on",
    "start_learning": "Start Learning",
    "generate_story": "Generate Story",
    "generating": "Generating",
    "story_deck_size_tooltip": "Deck must contain at least 3 words",
    "story_generation_tooltip": "Generate an AI-assisted story",
    "no_decks_message": "You haven't created any decks yet.",
    "no_decks_prompt": "Click 'Create New Cards' to get started!",
    "my_stories": "My Stories",
    "words_count": "words",
    "read": "Read",
    "no_stories_message": "You haven't generated any stories yet.",
    "no_stories_prompt": "Click 'Generate Story' on a deck with at least 3 words to create one!",
    "my_words": "My Words",
    "no_words_message": "You haven't created any words yet.",
    "confirm_deck_delete": "Are you sure you want to delete this deck? This will also delete all stories generated from this deck.",
    "story_generation_failed": "Failed to generate story.",
    "confirm_story_delete": "Are you sure you want to delete this story?",
    "confirm_import": "This will replace ALL of your current decks, words, and stories with the content from the file. This action cannot be undone. Are you sure you want to continue?",
    "import_success": "Data imported successfully!",
    "invalid_import_file": "Invalid file format. Please select a valid JSON backup file.",
    "import_failed": "Import failed",
    "ui_language": "UI Language",
    "native_language": "Native Language",
    "target_language": "Target Language",
    "settings": "Settings",
    // Creation Page
    "create_new_word_cards": "Create New Word Cards",
    "back_to_home": "Back to Home",
    "source_image_optional": "Source Image (Optional)",
    "upload_image_prompt": "Upload an image to extract words",
    "recognizing": "Recognizing...",
    "processing_image": "Processing image...",
    "image_recognition_failed": "Could not recognize any words from the image. Please try another image or enter words manually.",
    "image_processing_failed": "Failed to process image.",
    "remove_image": "Remove image",
    "ai_assistant_for_words": "AI Assistant for Words",
    "ai_upload_image_context": "Upload Image for Context",
    "generate_word_list": "Generate Words",
    "word_list_prompt_placeholder": "10 advanced words about technology",
    "generating_words": "Generating words...",
    "word_generation_failed": "Failed to generate word list.",
    "words_to_generate": "Words to Generate",
    "words_to_generate_desc_updated": "Enter words manually, upload an image, or use the AI Assistant to populate this list.",
    "words_placeholder": "e.g.\nambitious,\ndiligent,\nserendipity",
    "generation_mode": "Generation Mode",
    "word_deck": "Word Deck",
    "independent_words": "Independent Words",
    "deck_title": "Deck Title",
    "deck_title_placeholder": "e.g., 'Advanced Vocabulary'",
    "error_at_least_one_word": "Please enter at least one word.",
    "error_deck_title_required": "Please enter a deck title.",
    "starting_generation": "Starting generation...",
    "unknown_error": "An unknown error occurred.",
    "generate": "Generate",
     // Edit Pages
    "edit_deck": "Edit Deck",
    "return": "Return",
    "save_deck": "Save Deck",
    "add_new_words_to_deck": "Add New Words to Deck",
    "new_words_placeholder": "Enter new words here, separated by commas or new lines...",
    "add_error_at_least_one_word": "Please enter at least one word to add.",
    "add_word_error": "An error occurred while adding words.",
    "generate_and_add": "Generate & Add",
    "adding": "Adding...",
    "words_in_deck": "Words in Deck",
    "confirm_and_edit_words": "Confirm & Edit Words",
    "save_words": "Save Words",
    "unsaved_deck_draft_found": "Unsaved draft for this deck found. Do you want to restore it?",
    "unsaved_words_draft_found": "Unsaved draft for these words found. Do you want to restore it?",
    // WordCard Component
    "regenerate_card_confirm": "Are you sure you want to regenerate the content for \"{word}\"? All current modifications will be overwritten.",
    "regenerate_failed": "Failed to regenerate content for \"{word}\".",
    "definitions_examples": "Definitions & Examples",
    "collocations": "Collocations",
    "word_family": "Word Family",
    "synonyms": "Synonyms",
    "antonyms": "Antonyms",
    "mnemonics": "Mnemonics",
    // Study Page
    "study_complete": "Study Complete!",
    "study_complete_message": "You have reviewed all cards in the \"{deckTitle}\" deck.",
    "return_to_home": "Return to Home",
    "empty_deck_message": "This deck is empty.",
    "end_session": "End Session",
    "show_answer": "Show Answer",
    "learning": "Learning",
    "known": "Known",
    // Story View
    "story_generated_from": "Generated from {count} words on {date}",
  }
};

const UI_LANG_KEY = 'flashcardUILanguage';
const NATIVE_LANG_KEY = 'flashcardNativeLanguage';
const TARGET_LANG_KEY = 'flashcardTargetLanguage';
const DECKS_KEY = 'flashcardDecks';
const WORDS_KEY = 'flashcardWords';
const STORIES_KEY = 'flashcardStories';


let currentUILanguage: UILanguage = (localStorage.getItem(UI_LANG_KEY) as UILanguage) || 'zh';

const uiLanguageListeners = new Set<(lang: UILanguage) => void>();

export const onUILanguageChange = (callback: (lang: UILanguage) => void) => {
  uiLanguageListeners.add(callback);
};

export const offUILanguageChange = (callback: (lang: UILanguage) => void) => {
  uiLanguageListeners.delete(callback);
};

const notifyListeners = () => {
  uiLanguageListeners.forEach(callback => callback(currentUILanguage));
};

export const getUILanguage = (): UILanguage => currentUILanguage;

export const setUILanguage = (lang: UILanguage) => {
  currentUILanguage = lang;
  localStorage.setItem(UI_LANG_KEY, lang);
  notifyListeners();
};

export const getNativeLanguage = (): ContentLanguage => (localStorage.getItem(NATIVE_LANG_KEY) as ContentLanguage) || 'zh';
export const setNativeLanguage = (lang: ContentLanguage) => localStorage.setItem(NATIVE_LANG_KEY, lang);

export const getTargetLanguage = (): ContentLanguage => (localStorage.getItem(TARGET_LANG_KEY) as ContentLanguage) || 'en';
export const setTargetLanguage = (lang: ContentLanguage) => localStorage.setItem(TARGET_LANG_KEY, lang);

export const t = (key: string, replacements: Record<string, string | number> = {}): string => {
  let translation = translations[currentUILanguage]?.[key] || translations['en']?.[key] || key;
  for (const placeholder in replacements) {
    translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
  }
  return translation;
};

// --- END OF LANGUAGE SERVICE ---

// --- START OF DATA MIGRATION ---

const migrateWordCard = (card: any): WordCard => {
  // This function ensures old data from localStorage conforms to the new WordCard structure.
  return {
    ...card,
    targetLanguage: card.targetLanguage || 'en',
    nativeLanguage: card.nativeLanguage || 'zh',
    // Ensure required nested objects exist to prevent runtime errors on old data
    phonetics: card.phonetics || { uk: '', us: '' },
    partOfSpeech: card.partOfSpeech || { abbreviation: '', nativeName: '' },
    definitions: Array.isArray(card.definitions) ? card.definitions : [],
    collocations: Array.isArray(card.collocations) ? card.collocations : [],
    synonyms: Array.isArray(card.synonyms) ? card.synonyms : [],
    antonyms: Array.isArray(card.antonyms) ? card.antonyms : [],
    wordFamily: Array.isArray(card.wordFamily) ? card.wordFamily : [],
    mnemonic: Array.isArray(card.mnemonic) ? card.mnemonic : [],
  };
};

const migrateDeck = (deck: any): CardDeck => {
  return {
    ...deck,
    targetLanguage: deck.targetLanguage || 'en',
    nativeLanguage: deck.nativeLanguage || 'zh',
    cards: Array.isArray(deck.cards) ? deck.cards.map(migrateWordCard) : [],
  };
};

const migrateStory = (story: any): Story => {
  return {
    ...story,
    targetLanguage: story.targetLanguage || 'en',
    nativeLanguage: story.nativeLanguage || 'zh',
  };
};

// --- END OF DATA MIGRATION ---

export const getDecks = (): CardDeck[] => {
  try {
    const decksJson = localStorage.getItem(DECKS_KEY);
    const decks = decksJson ? JSON.parse(decksJson) : [];
    return decks.map(migrateDeck);
  } catch (error) {
    console.error("Error parsing decks from localStorage", error);
    return [];
  }
};

export const saveDecks = (decks: CardDeck[]): void => {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
};

export const getWords = (): WordCard[] => {
  try {
    const wordsJson = localStorage.getItem(WORDS_KEY);
    const words = wordsJson ? JSON.parse(wordsJson) : [];
    return words.map(migrateWordCard);
  } catch (error) {
    console.error("Error parsing words from localStorage", error);
    return [];
  }
};

export const saveWords = (words: WordCard[]): void => {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
};

export const getStories = (): Story[] => {
  try {
    const storiesJson = localStorage.getItem(STORIES_KEY);
    const stories = storiesJson ? JSON.parse(storiesJson) : [];
    return stories.map(migrateStory);
  } catch (error) {
    console.error("Error parsing stories from localStorage", error);
    return [];
  }
};

export const saveStories = (stories: Story[]): void => {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
};