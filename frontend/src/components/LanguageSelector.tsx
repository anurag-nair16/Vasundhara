import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Loader2, ChevronDown } from 'lucide-react';
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
                    size="sm"
                    className="h-9 gap-2 px-3 rounded-full border-border/60 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all duration-300"
                >
                    {isTranslating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium uppercase tracking-wide">
                        {currentLang?.code || 'EN'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/60 shadow-eco backdrop-blur-xl bg-background/95 p-2 animate-in fade-in-0 zoom-in-95">
                {supportedLanguages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center justify-between cursor-pointer rounded-lg px-3 py-2.5 hover:bg-muted text-sm"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg leading-none">{lang.flag}</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-foreground">{lang.nativeName}</span>
                                <span className="text-xs text-muted-foreground capitalize">{lang.name}</span>
                            </div>
                        </div>
                        {language === lang.code && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSelector;
