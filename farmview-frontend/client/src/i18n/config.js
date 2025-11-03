import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        documents: 'Documents',
        property: 'Property',
        insurance: 'Insurance',
        weather: 'Weather',
        profile: 'Profile',
        logout: 'Logout'
      },
      // Auth
      auth: {
        login: 'Login',
        signup: 'Sign Up',
        email: 'Email',
        password: 'Password',
        name: 'Full Name',
        mobile: 'Mobile Number',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        loginSuccess: 'Login successful!',
        signupSuccess: 'Registration successful!',
        loginButton: 'Sign In',
        signupButton: 'Create Account'
      },
      // Dashboard
      dashboard: {
        welcome: 'Welcome back',
        farmerId: 'Farmer ID',
        totalProperties: 'Total Properties',
        activeInsurance: 'Active Insurance',
        documents: 'Documents',
        weatherAlert: 'Weather Alert',
        recentActivity: 'Recent Activity',
        quickActions: 'Quick Actions'
      },
      // Common
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        upload: 'Upload',
        download: 'Download',
        submit: 'Submit',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        noData: 'No data available',
        search: 'Search',
        filter: 'Filter',
        actions: 'Actions'
      },
      // Documents
      documents: {
        title: 'My Documents',
        upload: 'Upload Document',
        type: 'Document Type',
        name: 'Document Name',
        category: 'Category',
        status: 'Status',
        uploadedOn: 'Uploaded On',
        types: {
          panCard: 'PAN Card',
          aadhaar: 'Aadhaar Card',
          landDocs: 'Land Documents',
          insurance: 'Insurance Policy',
          bankPassbook: 'Bank Passbook'
        }
      },
      // Property
      property: {
        title: 'My Properties',
        addProperty: 'Add Property',
        propertyName: 'Property Name',
        area: 'Area',
        location: 'Location',
        soilType: 'Soil Type',
        currentCrop: 'Current Crop',
        drawOnMap: 'Draw on Map'
      },
      // Insurance
      insurance: {
        title: 'Insurance',
        addPolicy: 'Add Policy',
        policyNumber: 'Policy Number',
        policyType: 'Policy Type',
        provider: 'Provider',
        coverage: 'Coverage Amount',
        premium: 'Premium',
        submitClaim: 'Submit Claim',
        claimHistory: 'Claim History'
      },
      // Weather
      weather: {
        title: 'Weather',
        current: 'Current Weather',
        forecast: 'Forecast',
        temperature: 'Temperature',
        humidity: 'Humidity',
        windSpeed: 'Wind Speed',
        rainfall: 'Rainfall'
      }
    }
  },
  hi: {
    translation: {
      nav: {
        dashboard: 'डैशबोर्ड',
        documents: 'दस्तावेज़',
        property: 'संपत्ति',
        insurance: 'बीमा',
        weather: 'मौसम',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट'
      },
      auth: {
        login: 'लॉगिन',
        signup: 'साइन अप',
        email: 'ईमेल',
        password: 'पासवर्ड',
        name: 'पूरा नाम',
        mobile: 'मोबाइल नंबर',
        confirmPassword: 'पासवर्ड की पुष्टि करें',
        forgotPassword: 'पासवर्ड भूल गए?',
        dontHaveAccount: 'खाता नहीं है?',
        alreadyHaveAccount: 'पहले से खाता है?',
        loginSuccess: 'लॉगिन सफल!',
        signupSuccess: 'पंजीकरण सफल!',
        loginButton: 'साइन इन करें',
        signupButton: 'खाता बनाएं'
      },
      dashboard: {
        welcome: 'स्वागत है',
        farmerId: 'किसान आईडी',
        totalProperties: 'कुल संपत्ति',
        activeInsurance: 'सक्रिय बीमा',
        documents: 'दस्तावेज़',
        weatherAlert: 'मौसम चेतावनी',
        recentActivity: 'हाल की गतिविधि',
        quickActions: 'त्वरित क्रियाएं'
      },
      common: {
        save: 'सहेजें',
        cancel: 'रद्द करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        view: 'देखें',
        upload: 'अपलोड करें',
        download: 'डाउनलोड करें',
        submit: 'जमा करें',
        loading: 'लोड हो रहा है...',
        success: 'सफलता',
        error: 'त्रुटि',
        noData: 'कोई डेटा उपलब्ध नहीं',
        search: 'खोजें',
        filter: 'फ़िल्टर',
        actions: 'क्रियाएं'
      },
      documents: {
        title: 'मेरे दस्तावेज़',
        upload: 'दस्तावेज़ अपलोड करें',
        type: 'दस्तावेज़ प्रकार',
        name: 'दस्तावेज़ का नाम',
        category: 'श्रेणी',
        status: 'स्थिति',
        uploadedOn: 'अपलोड की तारीख',
        types: {
          panCard: 'पैन कार्ड',
          aadhaar: 'आधार कार्ड',
          landDocs: 'भूमि दस्तावेज़',
          insurance: 'बीमा पॉलिसी',
          bankPassbook: 'बैंक पासबुक'
        }
      },
      property: {
        title: 'मेरी संपत्ति',
        addProperty: 'संपत्ति जोड़ें',
        propertyName: 'संपत्ति का नाम',
        area: 'क्षेत्रफल',
        location: 'स्थान',
        soilType: 'मिट्टी का प्रकार',
        currentCrop: 'वर्तमान फसल',
        drawOnMap: 'मानचित्र पर बनाएं'
      },
      insurance: {
        title: 'बीमा',
        addPolicy: 'पॉलिसी जोड़ें',
        policyNumber: 'पॉलिसी नंबर',
        policyType: 'पॉलिसी का प्रकार',
        provider: 'प्रदाता',
        coverage: 'कवरेज राशि',
        premium: 'प्रीमियम',
        submitClaim: 'दावा जमा करें',
        claimHistory: 'दावा इतिहास'
      },
      weather: {
        title: 'मौसम',
        current: 'वर्तमान मौसम',
        forecast: 'पूर्वानुमान',
        temperature: 'तापमान',
        humidity: 'आर्द्रता',
        windSpeed: 'हवा की गति',
        rainfall: 'बारिश'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
