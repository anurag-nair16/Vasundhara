import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { translateText, SUPPORTED_LANGUAGES, LanguageCode } from '@/services/translationService';
import { getUITranslation } from '@/services/uiTranslations';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (text: string) => string;
    translate: (text: string) => Promise<string>;
    isTranslating: boolean;
    supportedLanguages: typeof SUPPORTED_LANGUAGES;
    translationsApplied: boolean;
}

const STORAGE_KEY = 'vasundhara_language';
const ORIGINAL_TEXT_ATTR = 'data-original-text';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Inner provider that has access to router
const LanguageProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
                return stored as LanguageCode;
            }
        } catch (e) {
            console.warn('Failed to load language preference');
        }
        return 'en';
    });

    const [isTranslating, setIsTranslating] = useState(false);
    const [translationsApplied, setTranslationsApplied] = useState(false);
    const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch (e) {
            console.warn('Failed to save language preference');
        }
    }, [language]);

    const runTranslation = useCallback(async () => {
        if (language === 'en') {
            restoreOriginalText();
            setTranslationsApplied(false);
            return;
        }

        setIsTranslating(true);
        try {
            await translatePageContent(language);
            setTranslationsApplied(true);
        } catch (error) {
            console.error('Page translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    }, [language]);

    useEffect(() => {
        if (translationTimeoutRef.current) {
            clearTimeout(translationTimeoutRef.current);
        }
        translationTimeoutRef.current = setTimeout(runTranslation, 150);
        return () => {
            if (translationTimeoutRef.current) {
                clearTimeout(translationTimeoutRef.current);
            }
        };
    }, [language, runTranslation]);

    useEffect(() => {
        if (language !== 'en') {
            if (translationTimeoutRef.current) {
                clearTimeout(translationTimeoutRef.current);
            }
            translationTimeoutRef.current = setTimeout(runTranslation, 300);
        }
    }, [location.pathname, language, runTranslation]);

    useEffect(() => {
        if (language === 'en') return;

        const observer = new MutationObserver((mutations) => {
            const hasNewContent = mutations.some(mutation =>
                mutation.addedNodes.length > 0 &&
                Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === 1 && !(node as Element).hasAttribute(ORIGINAL_TEXT_ATTR)
                )
            );

            if (hasNewContent) {
                if (translationTimeoutRef.current) {
                    clearTimeout(translationTimeoutRef.current);
                }
                translationTimeoutRef.current = setTimeout(runTranslation, 200);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, [language, runTranslation]);

    const setLanguage = useCallback((lang: LanguageCode) => {
        setLanguageState(lang);
    }, []);

    // Instant translation for UI strings (synchronous)
    const t = useCallback((text: string): string => {
        return getUITranslation(text, language);
    }, [language]);

    const translate = useCallback(async (text: string): Promise<string> => {
        if (language === 'en' || !text.trim()) {
            return text;
        }
        return translateText(text, language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            translate,
            isTranslating,
            supportedLanguages: SUPPORTED_LANGUAGES,
            translationsApplied
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    try {
        return <LanguageProviderInner>{children}</LanguageProviderInner>;
    } catch {
        return <BasicLanguageProvider>{children}</BasicLanguageProvider>;
    }
};

const BasicLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
                return stored as LanguageCode;
            }
        } catch (e) {
            console.warn('Failed to load language preference');
        }
        return 'en';
    });

    const [isTranslating] = useState(false);
    const [translationsApplied] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch (e) {
            console.warn('Failed to save language preference');
        }
    }, [language]);

    const setLanguage = useCallback((lang: LanguageCode) => {
        setLanguageState(lang);
    }, []);

    const t = useCallback((text: string): string => {
        return getUITranslation(text, language);
    }, [language]);

    const translate = useCallback(async (text: string): Promise<string> => {
        if (language === 'en' || !text.trim()) {
            return text;
        }
        return translateText(text, language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            translate,
            isTranslating,
            supportedLanguages: SUPPORTED_LANGUAGES,
            translationsApplied
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

function getTextNodes(element: Element): { node: Element; text: string }[] {
    const nodes: { node: Element; text: string }[] = [];

    const translatableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span', 'button', 'a', 'label',
        'th', 'td', 'li'
    ];

    translatableSelectors.forEach(selector => {
        element.querySelectorAll(selector).forEach(el => {
            if (el.closest('script, style, input, textarea, select, [data-radix-collection-item], [data-no-translate]')) return;
            if (el.hasAttribute(ORIGINAL_TEXT_ATTR)) return;
            if (el.children.length > 0) return;

            const text = el.textContent?.trim();
            if (text && text.length > 1 && text.length < 500 && !/^[\d\s.,:%]+$/.test(text)) {
                nodes.push({ node: el, text });
            }
        });
    });

    return nodes;
}

function restoreOriginalText() {
    document.querySelectorAll(`[${ORIGINAL_TEXT_ATTR}]`).forEach(el => {
        const original = el.getAttribute(ORIGINAL_TEXT_ATTR);
        if (original) {
            el.textContent = original;
            el.removeAttribute(ORIGINAL_TEXT_ATTR);
        }
    });
}

async function translatePageContent(targetLang: LanguageCode) {
    const mainContent = document.body;
    const textNodes = getTextNodes(mainContent);

    const batchSize = 10;
    for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);

        await Promise.all(batch.map(async ({ node, text }) => {
            try {
                if (!node.hasAttribute(ORIGINAL_TEXT_ATTR)) {
                    node.setAttribute(ORIGINAL_TEXT_ATTR, text);
                }

                const translated = await translateText(text, targetLang);
                if (translated && translated !== text) {
                    node.textContent = translated;
                }
            } catch (error) {
                console.warn('Failed to translate:', text);
            }
        }));

        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const useTranslatedText = (text: string) => {
    const { translate, language } = useLanguage();
    const [translated, setTranslated] = useState(text);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (language === 'en') {
            setTranslated(text);
            return;
        }

        setLoading(true);
        translate(text).then(result => {
            if (!cancelled) {
                setTranslated(result);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [text, language, translate]);

    return { text: translated, loading };
};
