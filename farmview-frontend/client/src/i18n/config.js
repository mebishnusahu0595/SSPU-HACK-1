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
        profile: 'Profile',
        logout: 'Logout',
        calculator: 'Crop Calculator',
        insurance: 'Insurance',
        weather: 'Weather',
        claims: 'Claims',
        aiAdvisor: 'AI Advisor'
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
        search: 'Search',
        selectCrop: 'Select Crop',
        success: 'Success',
        error: 'Error',
        noData: 'No data available',
        filter: 'Filter',
        actions: 'Actions'
      },
      // Documents
      documents: {
        title: 'Documents',
        subtitle: 'Manage all your farm-related documents securely',
        yourDocuments: 'Your Documents',
        noDocuments: 'No documents found',
        noDocumentsUploaded: 'No documents uploaded yet',
        uploadDocument: 'Upload Document',
        documentName: 'Document Name',
        documentType: 'Document Type',
        searchDocuments: 'Search documents...',
        aiVerification: 'AI Document Verification',
        fraudPrevention: 'Automated fraud prevention',
        startAiVerification: 'Start AI Verification',
        manualUpload: 'Manual Upload',
        uploading: 'Uploading...',
        download: 'Download',
        aiVerified: 'AI Verified',
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
        drawOnMap: 'Draw on Map',
        searchLocation: 'Search Location',
        calculatedArea: 'Calculated Area',
        drawPolygon: 'Draw polygon on map',
        cropSuggestions: 'Choose from 1000+ crops or type to search',
        irrigationType: 'Irrigation Type',
        viewSatellite: 'View Satellite Analysis',
        noProperties: 'No Properties Yet',
        startByCreating: 'Start by creating your first property below',
        propertyDetails: 'Property Details',
        verified: 'Verified',
        pendingVerification: 'Pending Verification',
        noVerifiedDocs: 'No Verified Documents',
        verifyDocsWarning: 'We recommend verifying your land documents using AI for fraud prevention.',
        verifyNow: 'Verify Documents Now',
        submitting: 'Submitting...',
        createProperty: 'Create Property',
        cropRecommendations: 'Get Crop Recommendations (1000+ Crops)',
        gettingRecommendations: 'Getting Recommendations...',
        topRecommended: 'Top Recommended Crops',
        soilTypes: {
          alluvial: 'Alluvial',
          black: 'Black',
          red: 'Red',
          laterite: 'Laterite',
          desert: 'Desert',
          mountain: 'Mountain',
          other: 'Other'
        },
        irrigationTypes: {
          rainfed: 'Rainfed',
          drip: 'Drip',
          sprinkler: 'Sprinkler',
          other: 'Other'
        }
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
        title: 'Weather Monitoring',
        subtitle: 'Real-time weather and AI predictions',
        yourProperties: 'Your Properties',
        noProperties: 'No properties found',
        addPropertyFirst: 'Add a property first',
        selectProperty: 'Select a property',
        tapToLoad: 'Tap on a field on the left to load weather',
        aiPrediction: 'AI Crop Prediction',
        runPrediction: 'Run Prediction',
        predicting: 'Predicting...',
        riskAssessment: 'Overall Risk Assessment',
        aiConfidence: 'AI Confidence',
        activeAlerts: 'Active Alerts',
        recommendations: 'Actionable Recommendations',
        scientificBreakdown: 'Scientific Risk Breakdown',
        weatherLoaded: 'Weather loaded!',
        predictionCompleted: 'ML prediction completed!',
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
      },
      tools: {
        cropIntelligence: 'Crop Intelligence',
        cropIntelligenceDesc: 'AI-powered crop analysis',
        cropCalculator: 'Crop Calculator',
        cropCalculatorDesc: 'Yield & profit estimator',
        activeFarmer: 'Active Farmer',
        status: 'Status',
        active: 'Active',
        startByAdding: 'Start by adding your property or uploading documents'
      },
      calculator: {
        title: 'Quick Calculator',
        cropArea: 'Crop & Area (Hectares)',
        yield: 'Yield (Q/Ha)',
        price: 'Price (₹/Q)',
        profit: 'Estimated Profit',
        roi: 'ROI',
        reset: 'Reset',
        fullAnalysis: 'Full Analysis',
        crops: {
          wheat: 'Wheat',
          rice: 'Rice (Paddy)',
          cotton: 'Cotton',
          sugarcane: 'Sugarcane',
          maize: 'Maize'
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
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
        calculator: 'फसल कैलकुलेटर',
        insurance: 'बीमा',
        weather: 'मौसम',
        claims: 'दावे',
        aiAdvisor: 'AI सलाहकार'
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
        search: 'खोजें',
        selectCrop: 'फसल चुनें',
        success: 'सफलता',
        error: 'त्रुटि',
        noData: 'कोई डेटा उपलब्ध नहीं',
        filter: 'फ़िल्टर',
        actions: 'क्रियाएं'
      },
      documents: {
        title: 'दस्तावेज़',
        subtitle: 'अपने खेत से संबंधित सभी दस्तावेजों को सुरक्षित रूप से प्रबंधित करें',
        yourDocuments: 'आपके दस्तावेज़',
        noDocuments: 'कोई दस्तावेज़ नहीं मिला',
        noDocumentsUploaded: 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया है',
        uploadDocument: 'दस्तावेज़ अपलोड करें',
        documentName: 'दस्तावेज़ का नाम',
        documentType: 'दस्तावेज़ का प्रकार',
        searchDocuments: 'दस्तावेज़ खोजें...',
        aiVerification: 'AI दस्तावेज़ सत्यापन',
        fraudPrevention: 'स्वचालित धोखाधड़ी रोकथाम',
        startAiVerification: 'AI सत्यापन शुरू करें',
        manualUpload: 'मैन्युअल अपलोड',
        uploading: 'अपलोड किया जा रहा है...',
        download: 'डाउनलोड करें',
        aiVerified: 'AI सत्यापित',
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
        drawOnMap: 'मानचित्र पर बनाएं',
        searchLocation: 'स्थान खोजें',
        calculatedArea: 'परिकलित क्षेत्रफल',
        drawPolygon: 'मानचित्र पर बहुभुज बनाएं',
        cropSuggestions: '1000+ फसलों में से चुनें या खोजने के लिए टाइप करें',
        irrigationType: 'सिंचाई का प्रकार',
        viewSatellite: 'सैटेलाइट विश्लेषण देखें',
        noProperties: 'अभी तक कोई संपत्ति नहीं',
        startByCreating: 'नीचे अपनी पहली संपत्ति बनाकर शुरू करें',
        propertyDetails: 'संपत्ति का विवरण',
        verified: 'सत्यापित',
        pendingVerification: 'सत्यापन लंबित',
        noVerifiedDocs: 'कोई सत्यापित दस्तावेज़ नहीं',
        verifyDocsWarning: 'हम धोखाधड़ी को रोकने के लिए AI का उपयोग करके आपके भूमि दस्तावेज़ों को सत्यापित करने की सलाह देते हैं।',
        verifyNow: 'अभी दस्तावेज़ सत्यापित करें',
        submitting: 'जमा किया जा रहा है...',
        createProperty: 'संपत्ति बनाएं',
        cropRecommendations: 'फसल सिफारिशें प्राप्त करें (1000+ फसलें)',
        gettingRecommendations: 'सिफारिशें प्राप्त की जा रही हैं...',
        topRecommended: 'शीर्ष अनुशंसित फसलें',
        soilTypes: {
          alluvial: 'जलोढ़ (Alluvial)',
          black: 'काली (Black)',
          red: 'लाल (Red)',
          laterite: 'लेटराइट (Laterite)',
          desert: 'रेगिस्तानी (Desert)',
          mountain: 'पहाड़ी (Mountain)',
          other: 'अन्य'
        },
        irrigationTypes: {
          rainfed: 'वर्षा आधारित (Rainfed)',
          drip: 'ड्रिप (Drip)',
          sprinkler: 'स्प्रिंकलर (Sprinkler)',
          other: 'अन्य'
        }
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
        title: 'मौसम की निगरानी',
        subtitle: 'रीयल-टाइम मौसम और AI भविष्यवाणियां',
        yourProperties: 'आपकी संपत्तियां',
        noProperties: 'कोई संपत्ति नहीं मिली',
        addPropertyFirst: 'पहले एक संपत्ति जोड़ें',
        selectProperty: 'एक संपत्ति चुनें',
        tapToLoad: 'मौसम लोड करने के लिए बाईं ओर एक फ़ील्ड पर टैप करें',
        aiPrediction: 'AI फसल भविष्यवाणी',
        runPrediction: 'भविष्यवाणी चलाएं',
        predicting: 'भविष्यवाणी की जा रही है...',
        riskAssessment: 'कुल जोखिम मूल्यांकन',
        aiConfidence: 'AI आत्मविश्वास',
        activeAlerts: 'सक्रिय चेतावनियां',
        recommendations: 'कार्रवाई योग्य सिफारिशें',
        scientificBreakdown: 'वैज्ञानिक जोखिम विश्लेषण',
        weatherLoaded: 'मौसम लोड हो गया!',
        predictionCompleted: 'ML भविष्यवाणी पूरी हो गई!',
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
            desc: 'बेहतर उपज के लिए AI-संचालित अंतर्दष्टि'
          }
        },
        cta: {
          title: 'अपनी खेती को बदलने के लिए तैयार हैं?',
          subtitle: 'हजारों किसान पहले से ही उपज बढ़ाने और अपने निवेश की रक्षा के लिए FarmView AI का उपयोग कर रहे हैं',
          createAccount: 'मुफ्त खाता बनाएं',
          learnMore: 'और जानें'
        }
      },
      tools: {
        cropIntelligence: 'फसल बुद्धिमत्ता',
        cropIntelligenceDesc: 'AI-संचालित फसल विश्लेषण',
        cropCalculator: 'फसल कैलकुलेटर',
        cropCalculatorDesc: 'उपज और लाभ अनुमानक',
        activeFarmer: 'सक्रिय किसान',
        status: 'स्थिति',
        active: 'सक्रिय',
        startByAdding: 'अपनी संपत्ति जोड़कर या दस्तावेज़ अपलोड करके शुरू करें'
      },
      calculator: {
        title: 'त्वरित कैलकुलेटर',
        cropArea: 'फसल और क्षेत्र (हेक्टेयर)',
        yield: 'उपज (क्विंटल/हेक्टेयर)',
        price: 'कीमत (₹/क्विंटल)',
        profit: 'अनुमानित लाभ',
        roi: 'निवेश पर प्रतिफल (ROI)',
        reset: 'रीसेट',
        fullAnalysis: 'पूर्ण विश्लेषण',
        crops: {
          wheat: 'गेहूं',
          rice: 'चावल (धान)',
          cotton: 'कपास',
          sugarcane: 'गन्ना',
          maize: 'मक्का'
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
