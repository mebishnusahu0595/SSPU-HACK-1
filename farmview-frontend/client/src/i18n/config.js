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
      },
      // Landing Page
      landing: {
        heroTitle: 'Smart Farming with',
        heroTitleHighlight: 'AI Technology',
        heroSubtitle: 'Satellite-based crop monitoring, automated insurance claims with GeoAI verification, and complete farm management in one powerful platform',
        getStartedFree: 'Get Started Free',
        loginToDashboard: 'Login to Dashboard',
        geoaiBadge: 'Now with GeoAI Insurance Claims',
        benefits: {
          satellite: 'Real-time satellite monitoring of your crops',
          claims: 'Automated insurance claim processing',
          weather: 'Weather forecasts tailored to your location',
          documents: 'Secure document management system',
          multilang: 'Multi-language support for farmers',
          ai: 'AI-powered crop health analysis'
        },
        stats: {
          farmers: 'Farmers Registered',
          hectares: 'Hectares Monitored',
          claims: 'Claims Processed',
          uptime: 'Uptime Guarantee'
        },
        features: {
          title: 'Everything You Need to Succeed',
          subtitle: 'Comprehensive tools designed specifically for modern Indian farmers',
          property: {
            title: 'Property Management',
            desc: 'Draw and manage your farm boundaries on interactive maps'
          },
          documents: {
            title: 'Document Management',
            desc: 'Securely store and manage all your farm documents'
          },
          insurance: {
            title: 'Insurance Integration',
            desc: 'Manage policies and submit claims easily'
          },
          weather: {
            title: 'Weather Forecasts',
            desc: 'Get real-time weather updates for your location'
          },
          monitoring: {
            title: 'Crop Monitoring',
            desc: 'Satellite-based crop health analysis'
          },
          smart: {
            title: 'Smart Farming',
            desc: 'AI-powered insights for better yields'
          }
        },
        cta: {
          title: 'Ready to Transform Your Farm?',
          subtitle: 'Join thousands of farmers already using FarmView AI to increase yields and protect their investments',
          createAccount: 'Create Free Account',
          learnMore: 'Learn More'
        }
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
      },
      // Landing Page Hindi
      landing: {
        heroTitle: 'स्मार्ट खेती',
        heroTitleHighlight: 'AI तकनीक के साथ',
        heroSubtitle: 'सैटेलाइट-आधारित फसल निगरानी, GeoAI सत्यापन के साथ स्वचालित बीमा दावे, और एक शक्तिशाली प्लेटफॉर्म में पूर्ण कृषि प्रबंधन',
        getStartedFree: 'मुफ्त शुरू करें',
        loginToDashboard: 'डैशबोर्ड में लॉगिन करें',
        geoaiBadge: 'अब GeoAI बीमा दावों के साथ',
        benefits: {
          satellite: 'आपकी फसलों की रीयल-टाइम सैटेलाइट निगरानी',
          claims: 'स्वचालित बीमा दावा प्रसंस्करण',
          weather: 'आपके स्थान के लिए अनुकूलित मौसम पूर्वानुमान',
          documents: 'सुरक्षित दस्तावेज़ प्रबंधन प्रणाली',
          multilang: 'किसानों के लिए बहु-भाषा समर्थन',
          ai: 'AI-संचालित फसल स्वास्थ्य विश्लेषण'
        },
        stats: {
          farmers: 'पंजीकृत किसान',
          hectares: 'हेक्टेयर निगरानी',
          claims: 'दावे संसाधित',
          uptime: 'अपटाइम गारंटी'
        },
        features: {
          title: 'सफलता के लिए आवश्यक सब कुछ',
          subtitle: 'आधुनिक भारतीय किसानों के लिए विशेष रूप से डिज़ाइन किए गए व्यापक उपकरण',
          property: {
            title: 'संपत्ति प्रबंधन',
            desc: 'इंटरैक्टिव मानचित्र पर अपनी खेत की सीमाओं को बनाएं और प्रबंधित करें'
          },
          documents: {
            title: 'दस्तावेज़ प्रबंधन',
            desc: 'अपने सभी कृषि दस्तावेज़ों को सुरक्षित रूप से संग्रहीत और प्रबंधित करें'
          },
          insurance: {
            title: 'बीमा एकीकरण',
            desc: 'पॉलिसी प्रबंधित करें और आसानी से दावे जमा करें'
          },
          weather: {
            title: 'मौसम पूर्वानुमान',
            desc: 'अपने स्थान के लिए रीयल-टाइम मौसम अपडेट प्राप्त करें'
          },
          monitoring: {
            title: 'फसल निगरानी',
            desc: 'सैटेलाइट-आधारित फसल स्वास्थ्य विश्लेषण'
          },
          smart: {
            title: 'स्मार्ट खेती',
            desc: 'बेहतर उपज के लिए AI-संचालित अंतर्दृष्टि'
          }
        },
        cta: {
          title: 'अपनी खेती को बदलने के लिए तैयार हैं?',
          subtitle: 'हजारों किसान पहले से ही उपज बढ़ाने और अपने निवेश की रक्षा के लिए FarmView AI का उपयोग कर रहे हैं',
          createAccount: 'मुफ्त खाता बनाएं',
          learnMore: 'और जानें'
        }
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
