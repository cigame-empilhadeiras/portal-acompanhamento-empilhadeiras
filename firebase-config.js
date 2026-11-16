// Configuração do Firebase. Cole aqui os dados do seu projeto (Firebase Console > Configurações do projeto > Seus apps > Web).
// Estes valores NÃO são secretos: quem protege os dados são as regras do firestore.rules.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyB4nM8oagPS-gdWiNoeRz3IHgSYM45Ui20",
  authDomain: "portal-empilhadeiras.firebaseapp.com",
  projectId: "portal-empilhadeiras",
  storageBucket: "portal-empilhadeiras.firebasestorage.app",
  messagingSenderId: "70413694355",
  appId: "1:70413694355:web:3bffdfb5b4b4d5a6f66466",
  measurementId: "G-4YWXW3VMJY"
};
// Permite que qualquer pessoa crie conta na tela de login (ela só enxerga algo depois de liberada por um administrador).
// Mantenha false se preferir criar as contas você mesmo no Firebase Console.
window.ALLOW_SIGNUP = false;
// true = o login vale só enquanto a aba estiver aberta. false = a pessoa continua logada neste aparelho.
window.SESSION_ONLY = false;
