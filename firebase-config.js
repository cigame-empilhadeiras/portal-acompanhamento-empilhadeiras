// Configuração do Firebase. Cole aqui os dados do seu projeto (Firebase Console > Configurações do projeto > Seus apps > Web).
// Estes valores NÃO são secretos: quem protege os dados são as regras do firestore.rules.
window.FIREBASE_CONFIG = {
  apiKey: "COLE_AQUI",
  authDomain: "SEU-PROJETO.firebaseapp.com",
  projectId: "SEU-PROJETO",
  storageBucket: "SEU-PROJETO.appspot.com",
  messagingSenderId: "",
  appId: ""
};
// Permite que qualquer pessoa crie conta na tela de login (ela só enxerga algo depois de liberada por um administrador).
// Mantenha false se preferir criar as contas você mesmo no Firebase Console.
window.ALLOW_SIGNUP = false;
// true = o login vale só enquanto a aba estiver aberta. false = a pessoa continua logada neste aparelho.
window.SESSION_ONLY = false;
