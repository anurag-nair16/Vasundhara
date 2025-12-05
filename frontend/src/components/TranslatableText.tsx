import { useTranslatedText } from '@/contexts/LanguageContext';

interface TranslatableTextProps {
    children: string;
    as?: keyof JSX.IntrinsicElements;
    className?: string;
}

// Component to automatically translate text content
const TranslatableText = ({
    children,
    as: Tag = 'span',
    className
}: TranslatableTextProps) => {
    const { text, loading } = useTranslatedText(children);

    return (
        <Tag className={className}>
            {loading ? (
                <span className="animate-pulse">{children}</span>
            ) : (
                text
            )}
        </Tag>
    );
};

export default TranslatableText;
