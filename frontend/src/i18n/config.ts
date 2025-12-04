import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Vasundhara 2.0',
      carbonTracking: 'Carbon Tracking',
      wasteManagement: 'Waste Management',
      socialCredit: 'Social Credit',
      dashboard: 'Dashboard',
      profile: 'Profile',
      signIn: 'Sign In',
      signOut: 'Sign Out',
    }
  },
  hi: {
    translation: {
      welcome: 'वसुंधरा 2.0 में आपका स्वागत है',
      carbonTracking: 'कार्बन ट्रैकिंग',
      wasteManagement: 'कचरा प्रबंधन',
      socialCredit: 'सामाजिक क्रेडिट',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल',
      signIn: 'साइन इन करें',
      signOut: 'साइन आउट करें',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
