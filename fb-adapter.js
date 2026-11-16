/* Camada de ligação com o Firebase: login por e-mail e senha + banco Firestore em tempo real.
   Expõe window.claude.use("db") e window.claude.use("user") no mesmo formato que o painel já usa. */
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var SDK = window.FIREBASE_SDK_BASE || "https://www.gstatic.com/firebasejs/10.14.1";
  window.FB_MODE = true;
  var configured = !!(cfg.apiKey && cfg.projectId && !/COLE_AQUI|SEU-PROJETO/.test(cfg.apiKey + cfg.projectId));
  var S = {}, resolveReady, ready = new Promise(function (r) { resolveReady = r; });

  /* ---------- tela de login ---------- */
  var css = '#fbo{position:fixed;inset:0;z-index:99999;display:none;place-items:center;padding:20px;background:#0d1822;background-image:linear-gradient(135deg,#0d1822,#1f3347);font-family:system-ui,Segoe UI,Arial,sans-serif;color:#e8edf2}' +
    '#fbo.on{display:grid}#fbo .box{width:min(420px,100%);background:#fff;color:#16202a;border-radius:14px;padding:26px;box-shadow:0 20px 60px rgba(0,0,0,.45);border-top:6px solid #f2b705}' +
    '#fbo h1{margin:0 0 4px;font-size:1.35rem}#fbo p{margin:0 0 14px;color:#5d6975;font-size:.95rem}' +
    '#fbo label{display:block;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5d6975;margin:10px 0 4px}' +
    '#fbo input{width:100%;padding:12px;font-size:1rem;border:1px solid #c9d0d6;border-radius:8px}#fbo input:focus-visible,#fbo button:focus-visible{outline:3px solid #f2b705;outline-offset:2px}' +
    '#fbo .btn{width:100%;margin-top:16px;padding:13px;font-weight:700;font-size:1rem;letter-spacing:.04em;text-transform:uppercase;border:0;border-radius:9px;background:#f2b705;color:#16202a;cursor:pointer}' +
    '#fbo .lnk{display:inline-block;margin-top:12px;background:none;border:0;color:#2f4a63;font-size:.9rem;cursor:pointer;text-decoration:underline;padding:4px}' +
    '#fbo .err{min-height:1.3em;margin:10px 0 0;color:#c0392b;font-size:.9rem}#fbo .ok{color:#2e7d4f}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var ov = document.createElement("div"); ov.id = "fbo"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  function mount() { if (!ov.parentNode) document.body.appendChild(ov); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function show(html) { mount(); ov.innerHTML = '<div class="box">' + html + '</div>'; ov.className = "on"; }
  function hide() { ov.className = ""; }
  var MSG = { "auth/invalid-credential": "E-mail ou senha incorretos.", "auth/wrong-password": "E-mail ou senha incorretos.", "auth/user-not-found": "E-mail ou senha incorretos.", "auth/invalid-email": "E-mail inválido.", "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.", "auth/network-request-failed": "Sem conexão com a internet.", "auth/email-already-in-use": "Este e-mail já tem conta. Use Entrar.", "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.", "auth/user-disabled": "Esta conta foi desativada." };
  function showConfig() {
    show('<h1>Falta configurar o Firebase</h1><p>Abra o arquivo <b>firebase-config.js</b>, cole os dados do seu projeto e publique de novo. O passo a passo está no <b>README</b>.</p>');
  }
  function showLogin(mode) {
    var up = mode === "signup";
    show('<h1>Controle de Empilhadeiras</h1><p>' + (up ? "Crie a sua conta. Depois, um administrador libera o seu acesso." : "Entre com o seu e-mail e a sua senha.") + '</p>' +
      '<form id="fbf" novalidate><label for="fbe">E-mail</label><input id="fbe" type="email" autocomplete="username" required>' +
      '<label for="fbp">Senha</label><input id="fbp" type="password" autocomplete="' + (up ? "new-password" : "current-password") + '" required>' +
      '<p class="err" id="fbm" aria-live="polite"></p><button class="btn" type="submit">' + (up ? "Criar conta" : "Entrar") + '</button></form>' +
      '<button class="lnk" id="fbr" type="button">Esqueci a senha</button>' +
      (window.ALLOW_SIGNUP ? ' <button class="lnk" id="fbs" type="button">' + (up ? "Já tenho conta" : "Criar conta") + '</button>' : ""));
    var m = document.getElementById("fbm"), e = document.getElementById("fbe"), p = document.getElementById("fbp");
    setTimeout(function () { e.focus(); }, 30);
    document.getElementById("fbf").onsubmit = function (ev) {
      ev.preventDefault(); m.className = "err"; m.textContent = "";
      var em = e.value.trim(), pw = p.value;
      if (!em || !pw) { m.textContent = "Informe o e-mail e a senha."; return; }
      var op = up ? S.Au.createUserWithEmailAndPassword(S.auth, em, pw) : S.Au.signInWithEmailAndPassword(S.auth, em, pw);
      op.catch(function (er) { m.textContent = MSG[er && er.code] || "Não foi possível entrar. Tente de novo."; p.value = ""; });
    };
    document.getElementById("fbr").onclick = function () {
      m.className = "err"; var em = e.value.trim();
      if (!em) { m.textContent = "Digite o seu e-mail acima para receber o link de nova senha."; return; }
      S.Au.sendPasswordResetEmail(S.auth, em).then(function () { m.className = "err ok"; m.textContent = "Enviamos um link para redefinir a senha, se o e-mail tiver conta."; })
        .catch(function (er) { m.textContent = MSG[er && er.code] || "Não foi possível enviar o e-mail."; });
    };
    var sb = document.getElementById("fbs"); if (sb) sb.onclick = function () { showLogin(up ? "login" : "signup"); };
  }

  /* ---------- inicialização ---------- */
  function boot() {
    if (!configured) { if (document.body) showConfig(); else document.addEventListener("DOMContentLoaded", showConfig); return; }
    Promise.all([import(SDK + "/firebase-app.js"), import(SDK + "/firebase-auth.js"), import(SDK + "/firebase-firestore.js")]).then(function (m) {
      S.Au = m[1]; S.F = m[2];
      var app = m[0].initializeApp(cfg); S.auth = S.Au.getAuth(app); S.db = S.F.getFirestore(app);
      var pr = window.SESSION_ONLY && S.Au.setPersistence ? S.Au.setPersistence(S.auth, S.Au.browserSessionPersistence) : Promise.resolve();
      return pr.then(function () {
        S.Au.onAuthStateChanged(S.auth, function (user) {
          if (!user) { S.user = null; var go = function () { showLogin("login"); }; document.body ? go() : document.addEventListener("DOMContentLoaded", go); return; }
          S.user = user; S.email = String(user.email || "").toLowerCase(); S.papel = null; S.nome = "";
          window.FB_DIAG = "";
          S.F.getDoc(S.F.doc(S.db, "usuarios", S.email)).then(function (sn) {
            if (!sn.exists()) { window.FB_DIAG = 'Não existe o documento "' + S.email + '" na coleção "usuarios" do banco (default).'; return; }
            var d = sn.data(), ks = Object.keys(d).map(function (k) { return k + " = " + JSON.stringify(d[k]) + " (" + (typeof d[k] === "string" ? "string" : typeof d[k] === "boolean" ? "boolean" : typeof d[k]) + ")"; }).join(" · ");
            if (d.ativo === false) window.FB_DIAG = 'O cadastro está com ativo = false. Campos: ' + ks;
            else { S.papel = d.papel || null; S.nome = d.nome || ""; if (S.papel !== "admin" && S.papel !== "supervisor" && S.papel !== "operador" && S.papel !== "tablet") window.FB_DIAG = 'O campo papel não é reconhecido. Campos: ' + ks; }
          }).catch(function (er) {
            var c = er && er.code || String(er);
            window.FB_DIAG = c === "permission-denied" ? "O Firestore recusou a leitura (permission-denied): as regras do arquivo firestore.rules não estão publicadas neste projeto." : "Erro ao ler o cadastro: " + c + (er && er.message ? " · " + er.message : "");
          }).then(function () { if (window.FB_DIAG) console.warn("Diagnóstico de acesso:", window.FB_DIAG); hide(); resolveReady(user); });
        });
      });
    }).catch(function (er) { console.error(er); var go = function () { show('<h1>Não foi possível carregar o Firebase</h1><p>Verifique a internet e a configuração. (' + esc(er && er.message || er) + ')</p>'); }; document.body ? go() : document.addEventListener("DOMContentLoaded", go); });
  }

  /* ---------- API usada pelo painel ---------- */
  function dbWrapper() {
    return {
      collection: function (name) {
        var col = function () { return S.F.collection(S.db, name); };
        return {
          add: function (o) { return S.F.addDoc(col(), o); },
          doc: function (id) {
            var ref = function () { return S.F.doc(S.db, name, id); };
            return { set: function (o) { return S.F.setDoc(ref(), o); }, update: function (o) { return S.F.updateDoc(ref(), o); }, delete: function () { return S.F.deleteDoc(ref()); } };
          },
          onSnapshot: function (cb, err) {
            return S.F.onSnapshot(col(), function (sn) { cb({ docs: sn.docs.map(function (d) { return { id: d.id, data: function () { return d.data(); } }; }) }); },
              function (e) { console.warn("Firestore:", name, e && e.code); if (err) err(e); });
          }
        };
      }
    };
  }
  window.claude = {
    use: function (name) {
      return ready.then(function (user) {
        if (name === "db") return dbWrapper();
        if (name === "user") return { me: function () { return Promise.resolve({ id: user.uid, name: user.displayName || S.nome || S.email, email: S.email, isOwner: S.papel === "admin", canEdit: S.papel === "admin" }); } };
        return null;
      });
    },
    signOut: function () { return S.Au.signOut(S.auth).then(function () { location.hash = ""; location.reload(); }); }
  };
  boot();
})();
