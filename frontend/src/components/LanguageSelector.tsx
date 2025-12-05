import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LanguageSelector = () => {
    const { language, setLanguage, supportedLanguages, isTranslating } = useLanguage();

    const currentLang = supportedLanguages.find(l => l.code === language);

    const handleLanguageChange = (code: string) => {
        const lang = supportedLanguages.find(l => l.code === code);
        if (lang && code !== language) {
            setLanguage(code as any);
            if (code === 'en') {
                toast.success('Switched to English');
            } else {
                toast.info(`Translating to ${lang.nativeName}...`, {
                    duration: 2000,
                });
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full relative"
                >
                    {isTranslating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Globe className="h-4 w-4" />
                    )}
                    {language !== 'en' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {supportedLanguages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                        </div>
                        {language === lang.code && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSelector;
