/**
 * ASTRA All-India Multilingual Natural Language Understanding (NLU) Engine
 * Supports 12+ Indian Languages & Phonetic Transliteration Bridge
 * Package: co.singhsmusic.rhythmx
 */

export interface NLUResult {
  intent: 'PLAY' | 'PAUSE' | 'RESUME' | 'NEXT' | 'PREV' | 'VOLUME_UP' | 'VOLUME_DOWN' | 'LIKE' | 'SHUFFLE' | 'INFO' | 'SEARCH';
  query?: string;
  response: string;
  language: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi-IN', name: 'Hindi / Hinglish', native: 'हिन्दी', greeting: 'नमस्ते, मैं एस्ट्रा हूँ। आप क्या सुनना चाहेंगे?' },
  { code: 'en-IN', name: 'English (India)', native: 'English', greeting: 'Hi, I am Astra. What would you like to hear?' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਐਸਟਰਾ ਹਾਂ। ਕੀ ਸੁਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?' },
  { code: 'bho-IN', name: 'Bhojpuri', native: 'भोजपुरी', greeting: 'प्रणाम, हम एस्ट्रा बानी। का सुनल चाहब?' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', greeting: 'வணக்கம், நான் அஸ்ட்ரா. என்ன கேட்க விரும்புகிறீர்கள்?' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', greeting: 'నమస్కారం, నేను ఆస్ట్రా. మీరు ఏమి వినాలనుకుంటున్నారు?' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', greeting: 'নমস্কার, আমি অ্যাস্ট্রা। কি শুনতে চান?' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी', greeting: 'नमस्कार, मी अ‍ॅस्ट्रा आहे. आपण काय ऐकू इच्छिता?' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી', greeting: 'નમસ્તે, હું એસ્ટ્રા છું. તમે શું સાંભળવા માંગો છો?' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ, ನಾನು ಆಸ್ಟ್ರಾ. ನೀವು ಏನು ಕೇಳಲು ಬಯಸುತ್ತೀರಿ?' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', greeting: 'നമസ്കാരം, ഞാൻ ആസ്ട്ര. എന്താണ് കേൾക്കേണ്ടത്?' }
];

// Phonetic and colloquial transliteration replacements for Indian music queries
const PHONETIC_MAP: Record<string, string> = {
  'arjit': 'arijit singh',
  'arijit': 'arijit singh',
  'sidhu': 'sidhu moose wala',
  'moosewala': 'sidhu moose wala',
  'karan aujla': 'karan aujla',
  'aujla': 'karan aujla',
  'honey singh': 'yo yo honey singh',
  'yoyo': 'yo yo honey singh',
  'badshah': 'badshah',
  'diljit': 'diljit dosanjh',
  'dosanjh': 'diljit dosanjh',
  'shreya': 'shreya ghoshal',
  'anirudh': 'anirudh ravichander',
  'ar rahman': 'a.r. rahman',
  'rahman': 'a.r. rahman',
  'jubin': 'jubin nautiyal',
  'neha kakkar': 'neha kakkar',
  'sonu nigam': 'sonu nigam',
  'kk': 'kk hits',
  'pritam': 'pritam hits',
  'pawan singh': 'pawan singh',
  'khesari': 'khesari lal yadav',
  'shilpi raj': 'shilpi raj',
  'kaali gadi': 'kaali gaadi',
  'kali gadi': 'kaali gaadi',
  'kalyani': 'kalyani remix'
};

export const normalizeIndianQuery = (text: string): string => {
  let cleaned = text.toLowerCase().trim();
  for (const [key, replacement] of Object.entries(PHONETIC_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    cleaned = cleaned.replace(regex, replacement);
  }
  return cleaned;
};

export const parseAstraIntent = (rawTranscript: string, langCode = 'hi-IN'): NLUResult => {
  const text = rawTranscript.toLowerCase().trim();
  const isHindi = langCode.startsWith('hi') || langCode.startsWith('bho');

  // Control: Pause
  if (
    /\b(pause|stop|halt|roko|ruk|ruk jao|band karo|tham)\b/i.test(text)
  ) {
    return {
      intent: 'PAUSE',
      response: isHindi ? 'संगीत रोक दिया गया है।' : 'Playback paused.',
      language: langCode
    };
  }

  // Control: Resume
  if (
    /\b(resume|continue|unpause|chalu karo|bajao wapas|phir se bajao)\b/i.test(text)
  ) {
    return {
      intent: 'RESUME',
      response: isHindi ? 'संगीत फिर से शुरू कर रहे हैं।' : 'Resuming playback.',
      language: langCode
    };
  }

  // Control: Next
  if (
    /\b(next|skip|forward|agla|agle|aage badhao|change)\b/i.test(text)
  ) {
    return {
      intent: 'NEXT',
      response: isHindi ? 'अगला गाना लगा रहे हैं।' : 'Playing next track.',
      language: langCode
    };
  }

  // Control: Previous
  if (
    /\b(prev|previous|back|pichhla|piche karo|pehle wala)\b/i.test(text)
  ) {
    return {
      intent: 'PREV',
      response: isHindi ? 'पिछला गाना चला रहे हैं।' : 'Playing previous track.',
      language: langCode
    };
  }

  // Control: Volume Up
  if (
    /\b(volume up|louder|increase volume|awaaz badhao|tez karo|sound badhao)\b/i.test(text)
  ) {
    return {
      intent: 'VOLUME_UP',
      response: isHindi ? 'आवाज़ बढ़ा दी गई है।' : 'Increasing volume.',
      language: langCode
    };
  }

  // Control: Volume Down
  if (
    /\b(volume down|quieter|decrease volume|awaaz kam karo|dheemi karo|sound kam)\b/i.test(text)
  ) {
    return {
      intent: 'VOLUME_DOWN',
      response: isHindi ? 'आवाज़ कम कर दी गई है।' : 'Lowering volume.',
      language: langCode
    };
  }

  // Control: Like
  if (
    /\b(like|favorite|favourite|save|pasand hai|dil de do|accha hai)\b/i.test(text)
  ) {
    return {
      intent: 'LIKE',
      response: isHindi ? 'पसंदीदा गानों में जोड़ दिया।' : 'Saved to your liked tracks.',
      language: langCode
    };
  }

  // Control: Shuffle
  if (
    /\b(shuffle|mix karo|randomly bajao)\b/i.test(text)
  ) {
    return {
      intent: 'SHUFFLE',
      response: isHindi ? 'शफ़ल ऑन कर दिया है।' : 'Shuffle mode enabled.',
      language: langCode
    };
  }

  // Extract song / artist query for Play or Search
  // Remove command trigger words: "play", "stream", "bajaao", "bajao", "chalao", "sunao", "search for", "find"
  let cleanQuery = text
    .replace(/^(astra|hey astra|ok astra|please|kripya)\s+/i, '')
    .replace(/^(play|stream|listen to|bajaao|bajao|chalao|sunao|lagaao|lagao|dhundo|search for|find)\s+/i, '')
    .replace(/\s+(bajaao|bajao|chalao|sunao|lagaao|lagao|song|track|gaana)$/i, '')
    .trim();

  // If after stripping it's empty, fallback to original
  if (!cleanQuery) {
    cleanQuery = text;
  }

  const normalized = normalizeIndianQuery(cleanQuery);

  return {
    intent: 'PLAY',
    query: normalized,
    response: isHindi
      ? `"${normalized}" ढूँढ कर चला रहे हैं...`
      : `Streaming "${normalized}" in 320kbps Lossless...`,
    language: langCode
  };
};
