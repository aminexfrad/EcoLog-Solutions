import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "ecolog_lang";

const resources = {
  fr: {
    translation: {
      appName: "EcoLog Solutions",
      auth: {
        welcome: "Bienvenue",
        accessSpace: "Accédez à votre espace logistique.",
        login: "Se connecter",
        signup: "S'inscrire",
        noAccount: "Pas encore de compte ?",
        alreadyAccount: "Déjà inscrit ?",
        email: "Email",
        password: "Mot de passe",
        fullName: "Nom complet",
        profileType: "Type de profil",
        shipper: "Expéditeur",
        carrier: "Transporteur",
        client: "Client final",
      },
      nav: {
        dashboard: "Dashboard",
        shipments: "Expéditions",
        tracking: "Suivi GPS",
        carbon: "Bilan carbone",
        marketplace: "Marketplace CO2",
        esg: "Rapport ESG",
        notifications: "Notifications",
        profile: "Profil",
        missions: "Missions",
        fleet: "Flotte",
        certifications: "Certifications",
        orders: "Commandes",
        impact: "Impact carbone",
        documents: "Documents",
        users: "Utilisateurs",
        carriers: "Transporteurs",
        carbonRef: "Référentiel CO2",
        logs: "Audit logs",
        reports: "Rapports ESG",
      },
      common: {
        logout: "Déconnexion",
        action: "Action",
        loadingSession: "Chargement session...",
        score: "Score",
        send: "Envoyer",
        thinking: "EcoBot réfléchit...",
      },
      currency: { code: "TND" },
    },
  },
  en: {
    translation: {
      appName: "EcoLog Solutions",
      auth: {
        welcome: "Welcome",
        accessSpace: "Access your logistics workspace.",
        login: "Sign in",
        signup: "Sign up",
        noAccount: "No account yet?",
        alreadyAccount: "Already registered?",
        email: "Email",
        password: "Password",
        fullName: "Full name",
        profileType: "Profile type",
        shipper: "Shipper",
        carrier: "Carrier",
        client: "End customer",
      },
      nav: {
        dashboard: "Dashboard",
        shipments: "Shipments",
        tracking: "GPS Tracking",
        carbon: "Carbon footprint",
        marketplace: "CO2 Marketplace",
        esg: "ESG report",
        notifications: "Notifications",
        profile: "Profile",
        missions: "Missions",
        fleet: "Fleet",
        certifications: "Certifications",
        orders: "Orders",
        impact: "Carbon impact",
        documents: "Documents",
        users: "Users",
        carriers: "Carriers",
        carbonRef: "CO2 Reference",
        logs: "Audit logs",
        reports: "ESG Reports",
      },
      common: {
        logout: "Logout",
        action: "Action",
        loadingSession: "Loading session...",
        score: "Score",
        send: "Send",
        thinking: "EcoBot is thinking...",
      },
      currency: { code: "TND" },
    },
  },
  ar: {
    translation: {
      appName: "EcoLog Solutions",
      auth: {
        welcome: "مرحبا",
        accessSpace: "ادخل إلى مساحة اللوجستيك الخاصة بك.",
        login: "تسجيل الدخول",
        signup: "إنشاء حساب",
        noAccount: "ليس لديك حساب؟",
        alreadyAccount: "لديك حساب بالفعل؟",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        fullName: "الاسم الكامل",
        profileType: "نوع الحساب",
        shipper: "مُرسِل",
        carrier: "ناقل",
        client: "العميل النهائي",
      },
      nav: {
        dashboard: "لوحة التحكم",
        shipments: "الشحنات",
        tracking: "تتبع GPS",
        carbon: "البصمة الكربونية",
        marketplace: "سوق تعويض CO2",
        esg: "تقرير ESG",
        notifications: "الإشعارات",
        profile: "الملف الشخصي",
        missions: "المهام",
        fleet: "الأسطول",
        certifications: "الشهادات",
        orders: "الطلبات",
        impact: "الأثر الكربوني",
        documents: "المستندات",
        users: "المستخدمون",
        carriers: "الناقلون",
        carbonRef: "مرجع CO2",
        logs: "سجل التدقيق",
        reports: "تقارير ESG",
      },
      common: {
        logout: "تسجيل الخروج",
        action: "إجراء",
        loadingSession: "جارٍ تحميل الجلسة...",
        score: "النتيجة",
        send: "إرسال",
        thinking: "EcoBot يفكر...",
      },
      currency: { code: "TND" },
    },
  },
};

const saved = localStorage.getItem(STORAGE_KEY);
const initialLng = saved || "fr";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

function applyDir(lng) {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
}

applyDir(initialLng);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  applyDir(lng);
});

export default i18n;

