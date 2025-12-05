// Translation Service using MyMemory API
// Free tier: 50,000 characters/day with email

const API_BASE = 'https://api.mymemory.translated.net/get';
const CACHE_KEY = 'vasundhara_translations';

// Translation cache to reduce API calls
let translationCache: Record<string, Record<string, string>> = {};

// Load cache from localStorage
try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        translationCache = JSON.parse(cached);
    }
} catch (e) {
    console.warn('Failed to load translation cache');
}

// Save cache to localStorage
const saveCache = () => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
    } catch (e) {
        console.warn('Failed to save translation cache');
    }
};

// Get cache key for a translation
const getCacheKey = (text: string, targetLang: string): string => {
    return `${targetLang}:${text.substring(0, 50)}`;
};

// Translate a single text string
export const translateText = async (
    text: string,
    targetLang: string,
    sourceLang: string = 'en'
): Promise<string> => {
    // Don't translate if target is English or text is empty
    if (targetLang === 'en' || !text.trim()) {
        return text;
    }

    // Check cache first
    const cacheKey = getCacheKey(text, targetLang);
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey][text] || text;
    }

    try {
        const params = new URLSearchParams({
            q: text,
            langpair: `${sourceLang}|${targetLang}`,
            de: 'vasundhara@civic.app' // Email for higher limit
        });

        const response = await fetch(`${API_BASE}?${params}`);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            const translated = data.responseData.translatedText;

            // Cache the result
            if (!translationCache[cacheKey]) {
                translationCache[cacheKey] = {};
            }
            translationCache[cacheKey][text] = translated;
            saveCache();

            return translated;
        }

        return text;
    } catch (error) {
        console.error('Translation failed:', error);
        return text;
    }
};

// Translate multiple texts in batch (to reduce API calls)
export const translateBatch = async (
    texts: string[],
    targetLang: string,
    sourceLang: string = 'en'
): Promise<string[]> => {
    if (targetLang === 'en') {
        return texts;
    }

    const results: string[] = [];

    for (const text of texts) {
        const translated = await translateText(text, targetLang, sourceLang);
        results.push(translated);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
};

// Language configurations
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Clear translation cache
export const clearTranslationCache = () => {
    translationCache = {};
    localStorage.removeItem(CACHE_KEY);
};
