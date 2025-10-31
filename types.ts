import { Type } from '@google/genai';

export interface WordCard {
  id: string;
  word: string; // The word in the target language
  targetLanguage: string; // e.g., 'en'
  nativeLanguage: string; // e.g., 'zh'
  phonetics: { uk: string; us: string };
  audioPronunciation?: string;
  partOfSpeech: { abbreviation: string; nativeName: string };
  definitions: { definition: string; nativeDefinition: string; example: string; exampleTranslation: string; }[];
  collocations: { phrase: string; translation: string }[];
  synonyms: string[];
  antonyms: string[];
  wordFamily: { word: string; partOfSpeech: string; nativeTranslation: string }[];
  mnemonic: { type: string; targetLanguage: string; nativeLanguage: string }[];
  image?: string;
}

export interface CardDeck {
  id: string;
  title: string;
  cards: string[]; // This is now an array of WordCard IDs
  createdAt: string;
  targetLanguage: string;
  nativeLanguage: string;
}

export interface Story {
  id:string;
  deckId: string;
  title: string;
  content: string;
  words: string[];
  createdAt: string;
  targetLanguage: string;
  nativeLanguage: string;
}

export const wordCardSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The vocabulary word itself, in the target language." },
    targetLanguage: { type: Type.STRING, description: "The target language code, e.g., 'en'." },
    nativeLanguage: { type: Type.STRING, description: "The native language code, e.g., 'zh'." },
    phonetics: {
      type: Type.OBJECT,
      description: "Phonetic transcriptions. For English, use IPA for UK and US. Can be empty for other languages.",
      properties: {
        uk: { type: Type.STRING, description: "Phonetic transcription (IPA) for British English. Example: /əˈmbɪʃəs/" },
        us: { type: Type.STRING, description: "Phonetic transcription (IPA) for American English. Example: /æmˈbɪʃəs/" },
      },
      required: ['uk', 'us']
    },
    partOfSpeech: {
      type: Type.OBJECT,
      description: "The grammatical part of speech.",
      properties: {
        abbreviation: { type: Type.STRING, description: "The abbreviation in the target language (e.g., 'adj.', 'n.', 'v.')." },
        nativeName: { type: Type.STRING, description: "The name for the part of speech in the native language (e.g., '形容词', '名词')." }
      },
      required: ['abbreviation', 'nativeName']
    },
    definitions: {
      type: Type.ARRAY,
      description: "An array of 1 to 3 core definitions for the word.",
      items: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING, description: "A clear and concise definition of the word in the target language." },
          nativeDefinition: { type: Type.STRING, description: "The translation of the definition in the native language." },
          example: { type: Type.STRING, description: "A high-quality, natural-sounding example sentence using the word." },
          exampleTranslation: { type: Type.STRING, description: "The translation of the example sentence in the native language." }
        },
        required: ['definition', 'nativeDefinition', 'example', 'exampleTranslation']
      }
    },
    collocations: {
      type: Type.ARRAY,
      description: "An array of 2-4 common collocations or phrases with their native language translations.",
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING, description: "The collocation phrase in the target language." },
          translation: { type: Type.STRING, description: "The native language translation of the collocation." }
        },
        required: ['phrase', 'translation']
      }
    },
    synonyms: {
      type: Type.ARRAY,
      description: "An array of 2-4 close synonyms (in the target language).",
      items: { type: Type.STRING }
    },
    antonyms: {
      type: Type.ARRAY,
      description: "An array of 2-4 antonyms (in the target language).",
      items: { type: Type.STRING }
    },
    wordFamily: {
      type: Type.ARRAY,
      description: "An array of related words from the same family, with their meanings.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          // FIX: Changed `String` to `Type.STRING` to match the required enum type for the schema.
          partOfSpeech: { type: Type.STRING, description: "Part of speech abbreviation (e.g., 'n.', 'adv.')" },
          nativeTranslation: { type: Type.STRING, description: "A concise native language translation of the word." }
        },
        required: ['word', 'partOfSpeech', 'nativeTranslation']
      }
    },
    mnemonic: {
      type: Type.ARRAY,
      description: "An array of 2 to 3 clever mnemonic devices, each with a type, target language, and native language version.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "The type of mnemonic method." },
          targetLanguage: { type: Type.STRING, description: "The mnemonic in the target language." },
          nativeLanguage: { type: Type.STRING, description: "The mnemonic in the native language." }
        },
        required: ['type', 'targetLanguage', 'nativeLanguage']
      }
    }
  },
  required: ['word', 'targetLanguage', 'nativeLanguage', 'phonetics', 'partOfSpeech', 'definitions', 'collocations', 'synonyms', 'antonyms', 'wordFamily', 'mnemonic']
};