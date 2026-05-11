// مكون صفحة Placeholder قابل لإعادة الاستخدام
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Construction, ArrowRight } from 'lucide-react';

interface PlaceholderPageProps {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    icon?: React.ElementType;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
    titleAr,
    titleEn,
    descriptionAr,
    descriptionEn,
    icon: Icon = Construction
}) => {
    const { language } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20">
                <Icon size={48} className="text-primary" />
            </div>
            <h1 className="text-3xl font-black text-textPrimary mb-4">
                {language === 'ar' ? titleAr : titleEn}
            </h1>
            <p className="text-secondary text-lg max-w-md mb-8">
                {language === 'ar' ? descriptionAr : descriptionEn}
            </p>
            <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-bold border border-primary/20">
                <Construction size={20} />
                <span>{language === 'ar' ? 'قيد التطوير' : 'Under Development'}</span>
            </div>
        </div>
    );
};

export default PlaceholderPage;
