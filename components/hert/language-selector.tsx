'use client';

import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
    code: string;
    label: string;
    name: string;
    googleCode: string;
    flag: string;
}

const languages: LanguageOption[] = [
    { code: 'pl', label: 'Polski (PL)', name: 'Polski', googleCode: 'pl', flag: '🇵🇱' },
    { code: 'en', label: 'English (EN)', name: 'English', googleCode: 'en', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch (DE)', name: 'Deutsch', googleCode: 'de', flag: '🇩🇪' },
];

export default function LanguageSelector() {
    const [mounted, setMounted] = useState(false);
    const [language, setLanguage] = useState<string>('pl');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = document.cookie
            .split('; ')
            .find(row => row.startsWith('language='))
            ?.split('=')[1];
        if (saved) {
            setLanguage(saved);
        }
    }, []);

    const handleLanguageChange = async (langCode: string, googleCode: string) => {
        setLanguage(langCode);
        setOpen(false);

        // Zapisz w cookie
        document.cookie = `language=${langCode}; path=/; max-age=31536000`;

        // Wyzwól Google Translate
        setTimeout(() => {
            if ((window as any).google?.translate?.TranslateElement) {
                const element = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                if (element) {
                    element.value = googleCode;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }, 100);

        // Dispatch event dla powiadomienia o zmianie języka
        window.dispatchEvent(
            new CustomEvent('languageChanged', { detail: { language: langCode } })
        );
    };

    const selectedLanguage = languages.find(l => l.code === language);

    if (!mounted) {
        return (
            <button className="flex items-center space-x-1 border-l pl-4 ml-2 text-[11px] font-medium text-gray-600 hover:text-gray-900 transition">
                <span>{selectedLanguage?.flag}</span>
                <span>{selectedLanguage?.code.toUpperCase()}</span>
                <ChevronDown size={12} />
            </button>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center space-x-1 border-l pl-4 ml-2 text-[11px] font-medium text-gray-600 hover:text-hert transition">
                    <img
                        src={`/images/flags/${selectedLanguage?.code}.webp`}
                        alt={selectedLanguage?.label}
                        width={20}
                        height={13}
                        className="h-3"
                    />
                    <span>{selectedLanguage?.code.toUpperCase()}</span>
                    <ChevronDown size={12} className={`transition ${open ? 'rotate-180' : ''}`} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
                <div className="divide-y">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code, lang.googleCode)}
                            className={`w-full px-4 py-2 text-sm font-medium flex items-center justify-between hover:bg-blue-50 transition ${language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <img
                                    src={`/images/flags/${lang?.code}.webp`}
                                    alt={lang?.label}
                                    width={20}
                                    height={13}
                                    className="h-3"
                                />
                                <span>{lang.label}</span>
                            </div>
                            {language === lang.code && <Check size={16} className="text-blue-600" />}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
