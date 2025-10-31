import { GoogleGenAI, GenerateContentResponse, Modality } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { WordCard, wordCardSchema } from '../types';
import { getDecks, getWords, supportedContentLanguages, ContentLanguage } from './storageService';


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const recognizeWordsInImage = async (file: File): Promise<string[]> => {
  try {
    const imagePart = await fileToGenerativePart(file);
    const prompt = "Analyze this image and identify all distinct English words. List the words you find, separated by commas. Only return the words.";
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [imagePart, { text: prompt }] }],
    });

    const text = response.text;
    if (!text) {
      return [];
    }
    return text.split(',').map(word => word.trim().toLowerCase()).filter(Boolean);
  } catch (error) {
    console.error("Error recognizing words in image:", error);
    throw new Error("Failed to recognize words from the uploaded image.");
  }
};

export const generateWordList = async (prompt: string, targetLanguage: ContentLanguage, nativeLanguage: ContentLanguage): Promise<string[]> => {
  const targetLanguageName = supportedContentLanguages[targetLanguage];
  const nativeLanguageName = supportedContentLanguages[nativeLanguage];

  const systemPrompt = `You are a vocabulary expert for a user whose native language is ${nativeLanguageName} and is learning ${targetLanguageName}. 
  Your task is to generate a list of words based on the user's request.
  
  **Instructions:**
  - The words you generate MUST be in ${targetLanguageName}.
  - Your response MUST be a single line of text containing the words, separated by commas.
  - Do NOT include any explanations, introductory text, or formatting other than the comma-separated list.
  - For example, if the user asks for "10 words about space", your output should be something like: "galaxy, nebula, astronaut, cosmos, celestial, orbit, meteorite, supernova, constellation, vacuum".
  `;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      return [];
    }
    // Clean up the response just in case the model adds extra spaces or a final period.
    return text.replace(/\.$/, '').split(',').map(word => word.trim().toLowerCase()).filter(Boolean);
  } catch (error) {
    console.error("Error generating word list:", error);
    throw new Error("Failed to generate the word list. The model might be unavailable.");
  }
};


export const generateFlashcardDataForWord = async (word: string, targetLanguage: ContentLanguage, nativeLanguage: ContentLanguage): Promise<Omit<WordCard, 'id' | 'audioPronunciation' | 'image'>> => {
  const targetLanguageName = supportedContentLanguages[targetLanguage];
  const nativeLanguageName = supportedContentLanguages[nativeLanguage];

  const prompt = `
Generate a comprehensive vocabulary flashcard for the word "${word}" (target language: ${targetLanguageName}) for a user whose native language is ${nativeLanguageName}. 
Fulfill all requirements of the provided JSON schema. Ensure 'targetLanguage' is set to '${targetLanguage}' and 'nativeLanguage' is set to '${nativeLanguage}'.

**Key Instructions:**
- For 'partOfSpeech', provide the abbreviation in the target language and its name in the native language (e.g., 'adj.', '形容词').
- For 'definitions', provide both the definition in the target language and a concise translation in the native language. Also provide a translation for the example sentence.
- For 'collocations', provide common phrases and their native language translations.
- For 'wordFamily', provide related words, their part of speech, and a concise native language translation for each word.
- For 'synonyms' and 'antonyms', provide words in the target language only.
- Ensure all fields are populated with high-quality, accurate information. Example sentences should be natural.

**CRITICAL INSTRUCTION FOR 'mnemonic' FIELD:**
Generate an array of 2 to 3 **different** mnemonic objects based on methodologies suitable for the language pair. For each object, you MUST specify the 'type' with its name in the native language, and provide both 'targetLanguage' and 'nativeLanguage' content.

**Mnemonic Methodologies (Adapt as needed for the language pair):**

1.  **Phonetic Association (諧音联想)**
    *   **Principle**: Use the word's pronunciation similarity to native words to create a funny, memorable scene.

2.  **Etymology / Morphemic Analysis (词根词缀法)**
    *   **Principle**: Break the word into its morphemes (prefix, root, suffix) and explain how their meanings combine.

3.  **Storytelling Association (故事联想)**
    *   **Principle**: Create a short, vivid story or visual image for the word.

4.  **Personal Connection (个人关联)**
    *   **Principle**: Create a thought-provoking question that prompts the user to connect the word to their own life.

5.  **Contrast / Semantic Clustering (对比/分组记忆法)**
    *   **Principle**: Clarify meaning by contrasting the word with its synonyms or antonyms.

6.  **Spelling Mnemonics (拼写提示法)**
    *   **Principle**: Create a memorable phrase to help with difficult spellings.

Please select the 2-3 most suitable methods for the word "${word}" and provide high-quality, creative content for each.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: wordCardSchema,
      },
    });
    const parsedJson = JSON.parse(response.text);
    return parsedJson;
  } catch (error) {
    console.error(`Error generating card data for "${word}":`, error);
    throw new Error(`Failed to generate flashcard data for "${word}".`);
  }
};

export const generateStoryFromWords = async (title: string, words: string[], targetLanguage: ContentLanguage, nativeLanguage: ContentLanguage): Promise<string> => {
    const targetLanguageName = supportedContentLanguages[targetLanguage];
    const nativeLanguageName = supportedContentLanguages[nativeLanguage];

    const prompt = `
You are a creative storyteller. Your task is to write a short story (approximately 150-200 words) for a user whose native language is ${nativeLanguageName} and is learning ${targetLanguageName}.

The story MUST be written in ${targetLanguageName} and naturally incorporate the following vocabulary words:
${words.join(', ')}

**Instructions:**
1.  The story should be coherent, engaging, and easy to understand for a language learner.
2.  Use each word correctly in a context that helps illustrate its meaning.
3.  After writing the story, you **MUST** bold each of the target words using Markdown syntax (e.g., **word**). Do not bold any other words.
4.  The tone should be encouraging and helpful.
5.  Do not include a title or any introductory text like "Here is the story:". Just return the story content itself.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.8,
            },
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating story for deck "${title}":`, error);
        throw new Error(`Failed to generate a story. Please try again.`);
    }
};

export const generateSpeech = async (word: string, targetLanguage: ContentLanguage): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: word }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              // Using a voice that supports multiple languages well.
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio; // Return raw base64 encoded PCM data

  } catch (error) {
    console.error(`Error generating speech for "${word}":`, error);
    // Don't throw, just return undefined so the main process can continue
    return undefined;
  }
};


const DRAFT_KEY = 'word_generation_draft';
interface WordGenerationDraft {
  inputWords: string[];
  generatedCards: WordCard[];
}

/**
 * Processes a list of words, generating flashcard data for new words and reusing existing data for words already saved.
 * It uses a draft in localStorage to resume from failures.
 * @param words - An array of word strings to process.
 * @param onProgress - A callback function to report progress.
 * @returns A promise that resolves to an array of full WordCard objects.
 */
export const processAndGenerateWords = async (
  words: string[],
  targetLanguage: ContentLanguage,
  nativeLanguage: ContentLanguage,
  onProgress: (progress: string) => void
): Promise<WordCard[]> => {
  // 1. Load or initialize draft
  let generatedCards: WordCard[] = [];
  const uniqueInputWords = [...new Set(words.map(w => w.trim().toLowerCase()).filter(Boolean))];

  try {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    if (draftJson) {
      const draft: WordGenerationDraft = JSON.parse(draftJson);
      // Check if the draft is for the exact same set of input words
      if (JSON.stringify(draft.inputWords.sort()) === JSON.stringify(uniqueInputWords.sort())) {
        generatedCards = draft.generatedCards;
        onProgress('发现未完成的任务，正在恢复进度...');
      }
    }
  } catch (error) {
    console.error("Could not read generation draft:", error);
    localStorage.removeItem(DRAFT_KEY);
  }

  const alreadyGeneratedWords = new Set(generatedCards.map(c => c.word.toLowerCase()));

  // 2. Build a lookup map of existing words from permanent storage
  onProgress('正在加载本地数据...');
  const allDecks = getDecks();
  const allWords = getWords();
  const existingWordData = new Map<string, Omit<WordCard, 'id'>>();

  allDecks.forEach(deck => {
    deck.cards.forEach(card => {
      if (!existingWordData.has(card.word.toLowerCase())) {
        const { id, ...data } = card;
        existingWordData.set(card.word.toLowerCase(), data);
      }
    });
  });

  allWords.forEach(card => {
    if (!existingWordData.has(card.word.toLowerCase())) {
        const { id, ...data } = card;
        existingWordData.set(card.word.toLowerCase(), data);
    }
  });

  // 3. Process input words
  for (let i = 0; i < uniqueInputWords.length; i++) {
    const word = uniqueInputWords[i];

    if (alreadyGeneratedWords.has(word)) {
      onProgress(`已跳过已生成的单词 "${word}" (${i + 1}/${uniqueInputWords.length})`);
      continue;
    }
    
    if (existingWordData.has(word)) {
      onProgress(`发现本地存在的单词 "${word}" (${i + 1}/${uniqueInputWords.length})`);
      const cardData = existingWordData.get(word)!;
      generatedCards.push({
        id: uuidv4(),
        ...cardData,
      });
      // Small delay for UX
      await new Promise(res => setTimeout(res, 50));
    } else {
      onProgress(`正在为 "${word}" 生成数据 (${i + 1}/${uniqueInputWords.length})...`);
      const cardData = await generateFlashcardDataForWord(word, targetLanguage, nativeLanguage);
      
      onProgress(`正在为 "${word}" 生成发音 (${i + 1}/${uniqueInputWords.length})...`);
      const audioPronunciation = await generateSpeech(word, targetLanguage);

      const newCard: WordCard = {
        id: uuidv4(),
        ...cardData,
        audioPronunciation,
        image: undefined,
      };
      generatedCards.push(newCard);
      
      // Add newly generated word to map to avoid re-generating in the same batch
      const { id, ...data } = newCard;
      existingWordData.set(word.toLowerCase(), data);

      // Save progress to draft
      try {
        const draftToSave: WordGenerationDraft = {
          inputWords: uniqueInputWords,
          generatedCards: generatedCards,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
      } catch (error) {
        console.error("Failed to save generation draft:", error);
      }
    }
  }

  // 4. Clean up draft on successful completion
  localStorage.removeItem(DRAFT_KEY);
  
  return generatedCards;
};