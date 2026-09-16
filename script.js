"use strict";

/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS — BLOC 1/3
   Supabase + Authentification + Navigation
========================================================= */


/* =========================================================
   1. CONFIGURATION
========================================================= */

const SUPABASE_URL = "https://ujhghwjdecmuuqvllock.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_1luIJ43-R4_FXbjFuHrdiA_nLc5CEoO";

const WHATSAPP_NUMBER = "22607309472";

const WHATSAPP_URL =
  "https://wa.me/" + WHATSAPP_NUMBER;


/* =========================================================
   2. INITIALISATION SUPABASE
========================================================= */

if (!window.supabase) {
  console.error(
    "Supabase n'est pas chargé. Vérifie que le CDN Supabase est placé avant script.js."
  );
}

const supabaseClient = window.supabase
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    )
  : null;
const FOOTBALL_API_KEY = "747b09d2156ea2cb38237bb32596e13e";

/* =========================================================
   3. OUTILS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "Non définie";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Non définie";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function showMessage(elementId, message, type = "info") {
  const element = $(elementId);

  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = "message " + type;
}


/* =========================================================
   4. NAVIGATION
========================================================= */

function showSection(sectionId) {

  const sections = document.querySelectorAll(
    ".section"
  );

  sections.forEach(section => {
    section.style.display = "none";
  });


  const target = $(sectionId);

  if (target) {
    target.style.display = "block";
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (sectionId === "predictions") {
    if (typeof renderPredictions === "function") {
      renderPredictions();
    }
  }


  if (sectionId === "memberDashboard") {
    if (typeof renderMemberDashboard === "function") {
      renderMemberDashboard();
    }
  }


  if (sectionId === "adminDashboard") {
    if (typeof renderAdminDashboard === "function") {
      renderAdminDashboard();
    }
  }
}


/* =========================================================
   5. ACCUEIL
========================================================= */

function goHome() {
  showSection("home");
}


/* =========================================================
   6. PROFIL SUPABASE
========================================================= */

async function getProfile(userId) {

  if (!supabaseClient || !userId) {
    return null;
  }


  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();


  if (error) {
    console.error(
      "Erreur récupération profil :",
      error
    );

    return null;
  }


  return data;
}


/* =========================================================
   7. UTILISATEUR ACTUEL
========================================================= */

async function getCurrentUser() {

  if (!supabaseClient) {
    return null;
  }


  const {
    data,
    error
  } = await supabaseClient.auth.getUser();


  if (error) {
    console.error(
      "Erreur utilisateur actuel :",
      error
    );

    return null;
  }


  return data?.user || null;
}


/* =========================================================
   8. INSCRIPTION
========================================================= */

async function register(event) {

  if (event) {
    event.preventDefault();
  }


  const name =
    $("registerName")?.value.trim() || "";

  const whatsapp =
    $("registerWhatsapp")?.value.trim() || "";

  const email =
    $("registerEmail")?.value
      .trim()
      .toLowerCase() || "";

  const password =
    $("registerPassword")?.value || "";


  showMessage(
    "registerMessage",
    "",
    "info"
  );


  if (!name) {

    showMessage(
      "registerMessage",
      "Veuillez entrer votre nom.",
      "error"
    );

    return;
  }


  if (!whatsapp) {

    showMessage(
      "registerMessage",
      "Veuillez entrer votre numéro WhatsApp.",
      "error"
    );

    return;
  }


  if (!email) {

    showMessage(
      "registerMessage",
      "Veuillez entrer votre adresse email.",
      "error"
    );

    return;
  }


  if (!password || password.length < 6) {

    showMessage(
      "registerMessage",
      "Le mot de passe doit contenir au moins 6 caractères.",
      "error"
    );

    return;
  }


  if (!supabaseClient) {

    showMessage(
      "registerMessage",
      "Supabase n'est pas disponible.",
      "error"
    );

    return;
  }


  showMessage(
    "registerMessage",
    "Création de votre compte...",
    "info"
  );


  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signUp({

      email: email,

      password: password,

      options: {
        data: {
          name: name,
          whatsapp: whatsapp
        }
      }

    });


    if (error) {

      console.error(
        "Erreur inscription :",
        error
      );

      showMessage(
        "registerMessage",
        error.message,
        "error"
      );

      return;
    }


    if (!data?.user) {

      showMessage(
        "registerMessage",
        "Impossible de créer le compte.",
        "error"
      );

      return;
    }


    showMessage(
      "registerMessage",
      "Compte créé avec succès.",
      "success"
    );


    /*
      Si la confirmation email est activée
      dans Supabase, l'utilisateur devra
      confirmer son adresse email.
    */

    if (!data.session) {

      showMessage(
        "registerMessage",
        "Compte créé. Vérifiez votre email si Supabase demande une confirmation.",
        "success"
      );

      return;
    }


    showSection("memberDashboard");

    await renderMemberDashboard();

  } catch (error) {

    console.error(
      "Erreur inattendue inscription :",
      error
    );

    showMessage(
      "registerMessage",
      "Une erreur est survenue pendant l'inscription.",
      "error"
    );
  }
}


/* =========================================================
   9. CONNEXION MEMBRE
========================================================= */

async function login(event) {

  if (event) {
    event.preventDefault();
  }


  const email =
    $("loginEmail")?.value
      .trim()
      .toLowerCase() || "";

  const password =
    $("loginPassword")?.value || "";


  if (!email || !password) {

    showMessage(
      "loginMessage",
      "Veuillez remplir tous les champs.",
      "error"
    );

    return;
  }


  if (!supabaseClient) {

    showMessage(
      "loginMessage",
      "Supabase n'est pas disponible.",
      "error"
    );

    return;
  }


  showMessage(
    "loginMessage",
    "Connexion en cours...",
    "info"
  );


  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({

      email: email,

      password: password

    });


    if (error) {

      console.error(
        "Erreur connexion :",
        error
      );

      showMessage(
        "loginMessage",
        error.message,
        "error"
      );

      return;
    }


    if (!data?.user) {

      showMessage(
        "loginMessage",
        "Connexion impossible.",
        "error"
      );

      return;
    }


    const profile =
      await getProfile(data.user.id);


    if (profile?.role === "admin") {

      showSection("adminDashboard");

      await renderAdminDashboard();

    } else {

      showSection("memberDashboard");

      await renderMemberDashboard();

    }


    showMessage(
      "loginMessage",
      "Connexion réussie.",
      "success"
    );

  } catch (error) {

    console.error(
      "Erreur inattendue connexion :",
      error
    );

    showMessage(
      "loginMessage",
      "Une erreur est survenue pendant la connexion.",
      "error"
    );
  }
}


/* =========================================================
   10. CONNEXION ADMIN
   Compatible avec l'ancien formulaire :
   adminUsername = email administrateur
   adminPassword = mot de passe Supabase
========================================================= */

async function adminLogin(event) {

  if (event) {
    event.preventDefault();
  }


  const email =
    $("adminUsername")?.value
      .trim()
      .toLowerCase() || "";

  const password =
    $("adminPassword")?.value || "";


  if (!email || !password) {

    showMessage(
      "adminLoginMessage",
      "Entrez l'email et le mot de passe de votre compte administrateur.",
      "error"
    );

    return;
  }


  if (!supabaseClient) {

    showMessage(
      "adminLoginMessage",
      "Supabase n'est pas disponible.",
      "error"
    );

    return;
  }


  showMessage(
    "adminLoginMessage",
    "Connexion administrateur...",
    "info"
  );


  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({

      email: email,

      password: password

    });


    if (error) {

      console.error(
        "Erreur connexion admin :",
        error
      );

      showMessage(
        "adminLoginMessage",
        "Email ou mot de passe incorrect.",
        "error"
      );

      return;
    }


    const profile =
      await getProfile(data.user.id);


    if (!profile || profile.role !== "admin") {

      await supabaseClient.auth.signOut();

      showMessage(
        "adminLoginMessage",
        "Ce compte n'a pas les droits administrateur.",
        "error"
      );

      return;
    }


    showMessage(
      "adminLoginMessage",
      "Connexion administrateur réussie.",
      "success"
    );


    showSection("adminDashboard");

    await renderAdminDashboard();

  } catch (error) {

    console.error(
      "Erreur admin :",
      error
    );

    showMessage(
      "adminLoginMessage",
      "Une erreur est survenue.",
      "error"
    );
  }
}


/* =========================================================
   11. DÉCONNEXION
========================================================= */

async function logout() {

  if (!supabaseClient) {
    return;
  }


  try {

    await supabaseClient.auth.signOut();

    showSection("home");

  } catch (error) {

    console.error(
      "Erreur déconnexion :",
      error
    );
  }
}


/* =========================================================
   12. ÉTAT DE SESSION
========================================================= */

async function handleAuthState() {

  if (!supabaseClient) {
    return;
  }


  try {

    const {
      data
    } = await supabaseClient.auth.getSession();


    const session =
      data?.session;


    if (!session) {
      return;
    }


    const profile =
      await getProfile(
        session.user.id
      );


    if (profile?.role === "admin") {

      showSection("adminDashboard");

      if (typeof renderAdminDashboard === "function") {
        await renderAdminDashboard();
      }

    } else {

      showSection("memberDashboard");

      if (typeof renderMemberDashboard === "function") {
        await renderMemberDashboard();
      }
    }

  } catch (error) {

    console.error(
      "Erreur vérification session :",
      error
    );
  }
}


/* =========================================================
   13. ÉCOUTEUR AUTHENTIFICATION
========================================================= */

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      console.log(
        "État Auth Supabase :",
        event
      );

      if (!session) {
        return;
      }

      /*
        On évite de changer brutalement
        de page pendant INITIAL_SESSION
        si l'utilisateur est déjà sur une
        section publique.
      */

      if (
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION"
      ) {

        const profile =
          await getProfile(
            session.user.id
          );


        if (profile?.role === "admin") {

          showSection("adminDashboard");

          if (
            typeof renderAdminDashboard ===
            "function"
          ) {
            await renderAdminDashboard();
          }

        } else {

          showSection("memberDashboard");

          if (
            typeof renderMemberDashboard ===
            "function"
          ) {
            await renderMemberDashboard();
          }
        }
      }
    }
  );
}


/* =========================================================
   14. CONTACT PREMIUM WHATSAPP
========================================================= */

function contactPremium() {

  const message =
    "Bonjour WENDK PREDICT PRO, je souhaite souscrire à l'offre Premium.";

  const url =
    WHATSAPP_URL +
    "?text=" +
    encodeURIComponent(message);


  window.open(
    url,
    "_blank"
  );
}


/* =========================================================
   15. EXPORT DES FONCTIONS
   Nécessaire pour les boutons HTML
   utilisant onclick=""
========================================================= */

window.showSection = showSection;

window.goHome = goHome;

window.register = register;

window.login = login;

window.adminLogin = adminLogin;

window.logout = logout;

window.contactPremium = contactPremium;


/* =========================================================
   FIN DU BLOC 1/3
========================================================= */
/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS — BLOC 2/3
   Prédictions + Premium + Espace membre
========================================================= */


/* =========================================================
   16. RÉCUPÉRER L'ABONNEMENT ACTIF
========================================================= */

async function getActiveSubscription(userId) {

  if (!supabaseClient || !userId) {
    return null;
  }

  const now = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", now)
    .order("expires_at", {
      ascending: false
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erreur abonnement :",
      error
    );

    return null;
  }

  return data;
}


/* =========================================================
   17. VÉRIFIER PREMIUM
========================================================= */

async function checkPremium(userId) {

  const subscription =
    await getActiveSubscription(userId);

  return !!subscription;
}


/* =========================================================
   18. OBTENIR L'EXPIRATION PREMIUM
========================================================= */

async function getPremiumExpiration(userId) {

  const subscription =
    await getActiveSubscription(userId);

  if (!subscription) {
    return null;
  }

  return subscription.expires_at;
}


/* =========================================================
   19. PRÉDICTIONS
========================================================= */

const predictions = [

  {
    id: 1,
    date: "Aujourd'hui",
    league: "Exemple — Match 1",
    home: "Équipe A",
    away: "Équipe B",
    indication: "Victoire Équipe A",
    type: "GRATUIT"
  },

  {
    id: 2,
    date: "Aujourd'hui",
    league: "Exemple — Match 2",
    home: "Équipe C",
    away: "Équipe D",
    indication: "Plus de 1,5 buts",
    type: "PREMIUM"
  },

  {
    id: 3,
    date: "Aujourd'hui",
    league: "Exemple — Match 3",
    home: "Équipe E",
    away: "Équipe F",
    indication: "Double chance",
    type: "PREMIUM"
  },

  {
    id: 4,
    date: "Aujourd'hui",
    league: "Exemple — Match 4",
    home: "Équipe G",
    away: "Équipe H",
    indication: "Moins de 3,5 buts",
    type: "GRATUIT"
  }

];


/* =========================================================
   20. AFFICHER LES PRÉDICTIONS
========================================================= */

async function renderPredictions() {

  const container =
    $("predictionList");

  if (!container) {
    return;
  }

  container.innerHTML =
    "<p>Chargement des prédictions...</p>";


  const user =
    await getCurrentUser();


  let isPremium = false;

  if (user) {
    isPremium =
      await checkPremium(user.id);
  }


  let html = "";


  predictions.forEach(prediction => {

    const premiumLocked =
      prediction.type === "PREMIUM" &&
      !isPremium;


    html += `
      <div class="prediction-card">

        <div class="prediction-header">

          <span>
            ${escapeHTML(prediction.league)}
          </span>

          <span>
            ${escapeHTML(prediction.date)}
          </span>

        </div>


        <div class="prediction-teams">

          <strong>
            ${escapeHTML(prediction.home)}
          </strong>

          <span>VS</span>

          <strong>
            ${escapeHTML(prediction.away)}
          </strong>

        </div>


        <div class="prediction-indication">

          ${
            premiumLocked
              ? `
                <div class="premium-lock">
                  🔒 Indication Premium
                </div>

                <button
                  type="button"
                  onclick="contactPremium()"
                >
                  🔓 Débloquer Premium
                </button>
              `
              : `
                <strong>
                  Indication :
                </strong>

                ${escapeHTML(
                  prediction.indication
                )}
              `
          }

        </div>

      </div>
    `;

  });


  container.innerHTML = html;
}


/* =========================================================
   21. ESPACE MEMBRE
========================================================= */

async function renderMemberDashboard() {

  const user =
    await getCurrentUser();


  if (!user) {

    showSection("login");

    return;
  }


  const profile =
    await getProfile(user.id);


  const subscription =
    await getActiveSubscription(user.id);


  const name =
    profile?.name ||
    user.user_metadata?.name ||
    user.email ||
    "Membre";


  if ($("memberWelcome")) {

    $("memberWelcome").textContent =
      "Bienvenue " + name;
  }


  if ($("memberWhatsapp")) {

    $("memberWhatsapp").textContent =
      profile?.whatsapp ||
      user.user_metadata?.whatsapp ||
      "Non renseigné";
  }


  if (subscription) {

    if ($("memberStatus")) {

      $("memberStatus").innerHTML =
        "🟢 <strong>PREMIUM ACTIF</strong>";
    }


    if ($("memberExpiration")) {

      $("memberExpiration").textContent =
        formatDateTime(
          subscription.expires_at
        );
    }

  } else {

    if ($("memberStatus")) {

      $("memberStatus").innerHTML =
        "⚪ <strong>GRATUIT</strong>";
    }


    if ($("memberExpiration")) {

      $("memberExpiration").textContent =
        "Aucun abonnement Premium actif";
    }
  }


  await renderMemberHistory(user.id);
}


/* =========================================================
   22. HISTORIQUE DU MEMBRE
========================================================= */

async function renderMemberHistory(userId) {

  const container =
    $("memberHistory");

  if (!container) {
    return;
  }


  container.innerHTML =
    "<p>Chargement de l'historique...</p>";


  const [
    paymentsResult,
    subscriptionsResult
  ] = await Promise.all([

    supabaseClient
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      }),

    supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      })

  ]);


  if (paymentsResult.error) {

    console.error(
      "Erreur paiements membre :",
      paymentsResult.error
    );
  }


  if (subscriptionsResult.error) {

    console.error(
      "Erreur abonnements membre :",
      subscriptionsResult.error
    );
  }


  const payments =
    paymentsResult.data || [];

  const subscriptions =
    subscriptionsResult.data || [];


  if (
    payments.length === 0 &&
    subscriptions.length === 0
  ) {

    container.innerHTML =
      "<p>Aucun historique disponible.</p>";

    return;
  }


  let html = `
    <div class="member-history-list">
  `;


  subscriptions.forEach(subscription => {

    html += `
      <div class="history-item">

        <strong>
          ${escapeHTML(
            subscription.action ||
            "Abonnement Premium"
          )}
        </strong>

        <p>
          Durée :
          ${escapeHTML(
            subscription.days || 0
          )} jours
        </p>

        <p>
          Expiration :
          ${formatDateTime(
            subscription.expires_at
          )}
        </p>

        <small>
          ${formatDateTime(
            subscription.created_at
          )}
        </small>

      </div>
    `;

  });


  payments.forEach(payment => {

    html += `
      <div class="history-item">

        <strong>
          Paiement
        </strong>

        <p>
          Montant :
          ${Number(
            payment.amount || 0
          ).toLocaleString("fr-FR")} FCFA
        </p>

        <p>
          Méthode :
          ${escapeHTML(
            payment.method || "Non précisée"
          )}
        </p>

        <p>
          Statut :
          ${
            payment.verified
              ? "✅ Vérifié"
              : "⏳ En attente"
          }
        </p>

        <small>
          ${formatDateTime(
            payment.created_at
          )}
        </small>

      </div>
    `;

  });


  html += `
    </div>
  `;


  container.innerHTML = html;
}


/* =========================================================
   23. DEMANDE PREMIUM
========================================================= */

function submitPaymentRequest() {

  const message =
    [
      "Bonjour WENDK PREDICT PRO.",
      "",
      "Je souhaite souscrire à l'abonnement Premium.",
      "",
      "Je vais effectuer mon paiement Mobile Money et envoyer la preuve de paiement ici.",
      "",
      "Merci."
    ].join("\n");


  const url =
    WHATSAPP_URL +
    "?text=" +
    encodeURIComponent(message);


  window.open(
    url,
    "_blank"
  );
}


/* =========================================================
   24. AFFICHER / MASQUER MOT DE PASSE
========================================================= */

function togglePassword(inputId, button) {

  const input =
    $(inputId);

  if (!input) {
    return;
  }


  if (input.type === "password") {

    input.type = "text";

    if (button) {
      button.textContent = "🙈";
    }

  } else {

    input.type = "password";

    if (button) {
      button.textContent = "👁️";
    }
  }
}


/* =========================================================
   25. OUVRIR LE FORMULAIRE DE CONNEXION
========================================================= */

function openLogin() {
  showSection("login");
}


/* =========================================================
   26. OUVRIR LE FORMULAIRE D'INSCRIPTION
========================================================= */

function openRegister() {
  showSection("register");
}


/* =========================================================
   27. OUVRIR L'ESPACE MEMBRE
========================================================= */

async function openMemberDashboard() {

  const user =
    await getCurrentUser();


  if (!user) {

    showSection("login");

    return;
  }


  showSection("memberDashboard");

  await renderMemberDashboard();
}


/* =========================================================
   28. OUVRIR L'ESPACE ADMIN
========================================================= */

async function openAdminDashboard() {

  const user =
    await getCurrentUser();


  if (!user) {

    showSection("adminLogin");

    return;
  }


  const profile =
    await getProfile(user.id);


  if (!profile || profile.role !== "admin") {

    showSection("adminLogin");

    return;
  }


  showSection("adminDashboard");

  await renderAdminDashboard();
}


/* =========================================================
   29. EXPORT DES FONCTIONS
========================================================= */

window.getCurrentUser =
  getCurrentUser;

window.getProfile =
  getProfile;

window.getActiveSubscription =
  getActiveSubscription;

window.checkPremium =
  checkPremium;

window.getPremiumExpiration =
  getPremiumExpiration;

window.renderPredictions =
  renderPredictions;

window.renderMemberDashboard =
  renderMemberDashboard;

window.renderMemberHistory =
  renderMemberHistory;

window.submitPaymentRequest =
  submitPaymentRequest;

window.togglePassword =
  togglePassword;

window.openLogin =
  openLogin;

window.openRegister =
  openRegister;

window.openMemberDashboard =
  openMemberDashboard;

window.openAdminDashboard =
  openAdminDashboard;


/* =========================================================
   FIN DU BLOC 2/3
========================================================= */
/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS — BLOC 3/3
   ADMIN + MEMBRES + PAIEMENTS + PREMIUM
========================================================= */


/* =========================================================
   30. VÉRIFICATION ADMIN
========================================================= */

async function requireAdmin() {

  const user =
    await getCurrentUser();

  if (!user) {

    showSection("adminLogin");

    return null;
  }


  const profile =
    await getProfile(user.id);


  if (!profile || profile.role !== "admin") {

    showSection("adminLogin");

    return null;
  }


  return {
    user,
    profile
  };
}


/* =========================================================
   31. RÉCUPÉRER LES MEMBRES
========================================================= */

async function getMembers() {

  const { data, error } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("role", "member")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error(
      "Erreur membres :",
      error
    );

    return [];
  }


  return data || [];
}


/* =========================================================
   32. RÉCUPÉRER LES PAIEMENTS
========================================================= */

async function getAllPayments() {

  const { data, error } =
    await supabaseClient
      .from("payments")
      .select("*")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error(
      "Erreur paiements :",
      error
    );

    return [];
  }


  return data || [];
}


/* =========================================================
   33. RÉCUPÉRER LES ABONNEMENTS
========================================================= */

async function getAllSubscriptions() {

  const { data, error } =
    await supabaseClient
      .from("subscriptions")
      .select("*")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error(
      "Erreur abonnements :",
      error
    );

    return [];
  }


  return data || [];
}


/* =========================================================
   34. DASHBOARD ADMIN
========================================================= */

async function renderAdminDashboard() {

  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  const members =
    await getMembers();

  const payments =
    await getAllPayments();

  const subscriptions =
    await getAllSubscriptions();


  const now =
    new Date();


  let premiumCount = 0;

  let expiredCount = 0;


  members.forEach(member => {

    const active =
      subscriptions.find(subscription => {

        return (
          subscription.user_id === member.id &&
          new Date(
            subscription.expires_at
          ) > now
        );

      });


    if (active) {
      premiumCount++;
    } else {
      expiredCount++;
    }

  });


  if ($("totalMembers")) {

    $("totalMembers").textContent =
      members.length;
  }


  if ($("premiumMembers")) {

    $("premiumMembers").textContent =
      premiumCount;
  }


  if ($("expiredMembers")) {

    $("expiredMembers").textContent =
      expiredCount;
  }


  if ($("totalPayments")) {

    $("totalPayments").textContent =
      payments.length;
  }


  await renderAdminMembers(
    members,
    subscriptions
  );


  await renderAdminPayments(
    payments,
    members
  );
}


/* =========================================================
   35. AFFICHER LES MEMBRES ADMIN
========================================================= */

async function renderAdminMembers(
  members,
  subscriptions
) {

  const container =
    $("adminMembers");

  if (!container) {
    return;
  }


  if (!members.length) {

    container.innerHTML =
      "<p>Aucun membre enregistré.</p>";

    return;
  }


  let html = "";


  members.forEach(member => {

    const subscription =
      subscriptions.find(
        item =>
          item.user_id === member.id &&
          new Date(item.expires_at) >
            new Date()
      );


    const premium =
      !!subscription;


    html += `
      <div class="admin-member-item">

        <div>

          <strong>
            ${escapeHTML(
              member.name ||
              "Sans nom"
            )}
          </strong>

          <p>
            WhatsApp :
            ${escapeHTML(
              member.whatsapp ||
              "Non renseigné"
            )}
          </p>

          <p>
            Créé le :
            ${formatDate(
              member.created_at
            )}
          </p>

          <p>
            Statut :
            ${
              premium
                ? "🟢 PREMIUM"
                : "⚪ GRATUIT"
            }
          </p>

          ${
            premium
              ? `
                <p>
                  Expire le :
                  ${formatDateTime(
                    subscription.expires_at
                  )}
                </p>
              `
              : ""
          }

        </div>


        <div>

          <button
            type="button"
            onclick="openAdminModal('${member.id}')"
          >
            ⚙️ Gérer
          </button>

        </div>

      </div>
    `;
  });


  container.innerHTML = html;
}


/* =========================================================
   36. AFFICHER LES PAIEMENTS ADMIN
========================================================= */

async function renderAdminPayments(
  payments,
  members
) {

  const container =
    $("adminPayments");

  if (!container) {
    return;
  }


  if (!payments.length) {

    container.innerHTML =
      "<p>Aucun paiement enregistré.</p>";

    return;
  }


  let html = "";


  payments.forEach(payment => {

    const member =
      members.find(
        item =>
          item.id === payment.user_id
      );


    html += `
      <div class="admin-payment-item">

        <strong>
          ${escapeHTML(
            member?.name ||
            "Membre"
          )}
        </strong>

        <p>
          Montant :
          ${Number(
            payment.amount || 0
          ).toLocaleString("fr-FR")}
          FCFA
        </p>

        <p>
          Méthode :
          ${escapeHTML(
            payment.method ||
            "Non précisée"
          )}
        </p>

        <p>
          Référence :
          ${escapeHTML(
            payment.reference ||
            "Non fournie"
          )}
        </p>

        <p>
          Statut :
          ${
            payment.verified
              ? "✅ Vérifié"
              : "⏳ En attente"
          }
        </p>

        <small>
          ${formatDateTime(
            payment.created_at
          )}
        </small>

      </div>
    `;
  });


  container.innerHTML = html;
}


/* =========================================================
   37. OUVRIR MODAL ADMIN
========================================================= */

async function openAdminModal(memberId) {

  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  const member =
    (await getMembers()).find(
      item => item.id === memberId
    );


  if (!member) {

    alert(
      "Membre introuvable."
    );

    return;
  }


  if ($("adminModal")) {

    $("adminModal").style.display =
      "flex";
  }


  if ($("paymentMemberId")) {

    $("paymentMemberId").value =
      member.id;
  }


  if ($("selectedMemberInfo")) {

    $("selectedMemberInfo").innerHTML = `

      <strong>
        ${escapeHTML(
          member.name ||
          "Sans nom"
        )}
      </strong>

      <br>

      WhatsApp :
      ${escapeHTML(
        member.whatsapp ||
        "Non renseigné"
      )}

      <br>

      Email :
      ${escapeHTML(
        "Compte Supabase"
      )}

    `;
  }


  if ($("adminActionMessage")) {

    $("adminActionMessage").textContent =
      "";
  }
}


/* =========================================================
   38. FERMER MODAL ADMIN
========================================================= */

function closeAdminModal() {

  const modal =
    $("adminModal");


  if (modal) {

    modal.style.display =
      "none";
  }
}


/* =========================================================
   39. CALCULER LA DURÉE PREMIUM
========================================================= */

function getPremiumDays() {

  const duration =
    $("premiumDuration")?.value ||
    "custom";


  if (duration === "7") {
    return 7;
  }


  if (duration === "15") {
    return 15;
  }


  if (duration === "30") {
    return 30;
  }


  if (duration === "60") {
    return 60;
  }


  if (duration === "90") {
    return 90;
  }


  if (duration === "custom") {

    const days =
      Number(
        $("customDays")?.value || 0
      );


    return days;
  }


  return 0;
}


/* =========================================================
   40. ACTIVER / PROLONGER PREMIUM
========================================================= */

async function verifyPaymentAndActivatePremium() {

  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  const userId =
    $("paymentMemberId")?.value || "";


  const amount =
    Number(
      $("paymentAmount")?.value || 0
    );


  const method =
    $("paymentMethod")?.value.trim() ||
    "Mobile Money";


  const reference =
    $("paymentReference")?.value.trim() ||
    "Non fournie";


  const note =
    $("paymentNote")?.value.trim() ||
    "";


  const days =
    getPremiumDays();


  if (!userId) {

    showMessage(
      "adminActionMessage",
      "Aucun membre sélectionné.",
      "error"
    );

    return;
  }


  if (!amount || amount <= 0) {

    showMessage(
      "adminActionMessage",
      "Entrez le montant du paiement.",
      "error"
    );

    return;
  }


  if (!days || days <= 0) {

    showMessage(
      "adminActionMessage",
      "Indiquez une durée Premium valide.",
      "error"
    );

    return;
  }


  showMessage(
    "adminActionMessage",
    "Enregistrement du paiement et activation Premium...",
    "info"
  );


  try {

    /*
      Vérification d'un abonnement
      actuellement actif.
    */

    const currentSubscription =
      await getActiveSubscription(
        userId
      );


    let startAt =
      new Date();


    /*
      Si le membre possède déjà un
      Premium actif, la nouvelle durée
      commence après son expiration.
    */

    if (currentSubscription) {

      const currentExpiration =
        new Date(
          currentSubscription.expires_at
        );


      if (
        currentExpiration > startAt
      ) {

        startAt =
          currentExpiration;
      }
    }


    const expiresAt =
      new Date(startAt);


    expiresAt.setDate(
      expiresAt.getDate() +
      days
    );


    /* -----------------------------------------
       ENREGISTRER LE PAIEMENT
    ----------------------------------------- */

    const {
      error: paymentError
    } = await supabaseClient
      .from("payments")
      .insert({

        user_id: userId,

        amount: amount,

        method: method,

        reference: reference,

        note: note,

        verified: true,

        verified_by: auth.user.id

      });


    if (paymentError) {

      console.error(
        "Erreur paiement :",
        paymentError
      );

      throw paymentError;
    }


    /* -----------------------------------------
       CRÉER L'ABONNEMENT
    ----------------------------------------- */

    const {
      error: subscriptionError
    } = await supabaseClient
      .from("subscriptions")
      .insert({

        user_id: userId,

        start_at:
          startAt.toISOString(),

        expires_at:
          expiresAt.toISOString(),

        days: days,

        action:
          currentSubscription
            ? "Extension Premium"
            : "Activation Premium",

        created_by:
          auth.user.id

      });


    if (subscriptionError) {

      console.error(
        "Erreur abonnement :",
        subscriptionError
      );

      throw subscriptionError;
    }


    showMessage(
      "adminActionMessage",
      "✅ Paiement vérifié et Premium activé avec succès jusqu'au " +
        formatDateTime(
          expiresAt
        ),
      "success"
    );


    /*
      Actualiser le dashboard.
    */

    await renderAdminDashboard();


    /*
      Actualiser le formulaire
      membre si besoin.
    */

    const currentUser =
      await getCurrentUser();


    if (
      currentUser &&
      currentUser.id === userId
    ) {

      await renderMemberDashboard();
    }


  } catch (error) {

    console.error(
      "Erreur activation Premium :",
      error
    );


    showMessage(
      "adminActionMessage",
      "Erreur : " +
        (
          error.message ||
          "Impossible d'activer Premium."
        ),
      "error"
    );
  }
}


/* =========================================================
   41. DÉSACTIVER PREMIUM
========================================================= */

async function disablePremium() {

  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  const userId =
    $("paymentMemberId")?.value || "";


  if (!userId) {

    showMessage(
      "adminActionMessage",
      "Aucun membre sélectionné.",
      "error"
    );

    return;
  }


  const subscription =
    await getActiveSubscription(
      userId
    );


  if (!subscription) {

    showMessage(
      "adminActionMessage",
      "Ce membre n'a pas de Premium actif.",
      "info"
    );

    return;
  }


  const {
    error
  } = await supabaseClient
    .from("subscriptions")
    .update({

      expires_at:
        new Date().toISOString()

    })
    .eq(
      "id",
      subscription.id
    );


  if (error) {

    console.error(
      "Erreur désactivation :",
      error
    );


    showMessage(
      "adminActionMessage",
      "Impossible de désactiver Premium.",
      "error"
    );

    return;
  }


  showMessage(
    "adminActionMessage",
    "Premium désactivé.",
    "success"
  );


  await renderAdminDashboard();
}


/* =========================================================
   42. RECHERCHE MEMBRE
========================================================= */

async function searchAdminMembers() {

  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  const search =
    $("memberSearch")?.value
      .trim()
      .toLowerCase() || "";


  const members =
    await getMembers();


  const subscriptions =
    await getAllSubscriptions();


  if (!search) {

    await renderAdminMembers(
      members,
      subscriptions
    );

    return;
  }


  const filtered =
    members.filter(member => {

      const name =
        (
          member.name || ""
        ).toLowerCase();


      const whatsapp =
        (
          member.whatsapp || ""
        ).toLowerCase();


      return (
        name.includes(search) ||
        whatsapp.includes(search)
      );

    });


  await renderAdminMembers(
    filtered,
    subscriptions
  );
}


/* =========================================================
   43. ÉCOUTEUR RECHERCHE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const searchInput =
      $("memberSearch");


    if (searchInput) {

      searchInput.addEventListener(
        "input",
        searchAdminMembers
      );
    }


    /*
      Afficher l'accueil au démarrage
      si aucune section n'est déjà visible.
    */

    const visibleSection =
      document.querySelector(
        ".section[style*='display: block']"
      );


    if (!visibleSection) {

      const home =
        $("home");

      if (home) {
        home.style.display =
          "block";
      }
    }


    /*
      Vérifier la session Supabase.
    */

    setTimeout(
      handleAuthState,
      100
    );

  }
);


/* =========================================================
   44. FERMETURE DU MODAL EN CLIQUANT À L'EXTÉRIEUR
========================================================= */

document.addEventListener(
  "click",
  event => {

    const modal =
      $("adminModal");


    if (
      modal &&
      event.target === modal
    ) {

      closeAdminModal();
    }

  }
);


/* =========================================================
   45. EXPORT FINAL DES FONCTIONS
========================================================= */

window.requireAdmin =
  requireAdmin;

window.getMembers =
  getMembers;

window.getAllPayments =
  getAllPayments;

window.getAllSubscriptions =
  getAllSubscriptions;

window.renderAdminDashboard =
  renderAdminDashboard;

window.renderAdminMembers =
  renderAdminMembers;

window.renderAdminPayments =
  renderAdminPayments;

window.openAdminModal =
  openAdminModal;

window.closeAdminModal =
  closeAdminModal;

window.getPremiumDays =
  getPremiumDays;

window.verifyPaymentAndActivatePremium =
  verifyPaymentAndActivatePremium;

window.disablePremium =
  disablePremium;

window.searchAdminMembers =
  searchAdminMembers;


/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS COMPLET — FIN
========================================================= */

console.log(
  "WENDK PREDICT PRO V3 — Supabase connecté"
);
/* =========================================================
   WENDK PREDICT PRO V3
   STATISTIQUES ADMIN
========================================================= */


/* =========================================================
   46. CRÉER LE PANNEAU STATISTIQUES
========================================================= */

function createAdminStatsPanel() {

  const dashboard =
    $("adminDashboard");

  if (!dashboard) {
    return null;
  }


  let panel =
    $("wendkAdminStats");


  if (panel) {
    return panel;
  }


  panel =
    document.createElement("div");

  panel.id =
    "wendkAdminStats";


  panel.innerHTML = `

    <div style="
      margin:20px 0;
      padding:20px;
      border-radius:16px;
      background:#ffffff;
      box-shadow:0 8px 25px rgba(0,0,0,.08);
    ">

      <h2 style="
        margin-top:0;
        margin-bottom:18px;
      ">
        📊 Statistiques WENDK PREDICT PRO
      </h2>


      <div style="
        display:grid;
        grid-template-columns:
          repeat(auto-fit,minmax(180px,1fr));
        gap:14px;
      ">


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">👥</div>
          <div class="wendk-stat-label">
            Total membres
          </div>
          <div id="statTotalMembers"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">🟢</div>
          <div class="wendk-stat-label">
            Premium actifs
          </div>
          <div id="statPremiumActive"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">⚪</div>
          <div class="wendk-stat-label">
            Membres gratuits
          </div>
          <div id="statFreeMembers"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">⏰</div>
          <div class="wendk-stat-label">
            Premium expirés
          </div>
          <div id="statExpiredPremium"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">💰</div>
          <div class="wendk-stat-label">
            Paiements vérifiés
          </div>
          <div id="statVerifiedPayments"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">📅</div>
          <div class="wendk-stat-label">
            Paiements 30 jours
          </div>
          <div id="statPayments30Days"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">💎</div>
          <div class="wendk-stat-label">
            Abonnements Premium
          </div>
          <div id="statSubscriptions"
               class="wendk-stat-value">
            0
          </div>
        </div>


        <div class="wendk-stat-card">
          <div class="wendk-stat-icon">📈</div>
          <div class="wendk-stat-label">
            Revenus vérifiés
          </div>
          <div id="statRevenue"
               class="wendk-stat-value">
            0 FCFA
          </div>
        </div>

      </div>

    </div>

  `;


  /*
    On place les statistiques en haut
    du tableau de bord admin.
  */

  dashboard.prepend(panel);


  return panel;
}


/* =========================================================
   47. STYLE DES STATISTIQUES
========================================================= */

function addAdminStatsStyles() {

  if ($("wendkAdminStatsStyles")) {
    return;
  }


  const style =
    document.createElement("style");


  style.id =
    "wendkAdminStatsStyles";


  style.textContent = `

    .wendk-stat-card {
      padding:18px;
      border-radius:14px;
      background:#f8fafc;
      border:1px solid #e5e7eb;
      transition:
        transform .2s ease,
        box-shadow .2s ease;
    }


    .wendk-stat-card:hover {
      transform:translateY(-3px);
      box-shadow:
        0 8px 20px rgba(0,0,0,.08);
    }


    .wendk-stat-icon {
      font-size:28px;
      margin-bottom:8px;
    }


    .wendk-stat-label {
      font-size:14px;
      color:#64748b;
      margin-bottom:6px;
    }


    .wendk-stat-value {
      font-size:24px;
      font-weight:800;
      color:#111827;
    }


    @media(max-width:600px) {

      .wendk-stat-value {
        font-size:21px;
      }

      #wendkAdminStats {
        margin-left:0;
        margin-right:0;
      }

    }

  `;


  document.head.appendChild(style);
}


/* =========================================================
   48. CALCULER LES STATISTIQUES
========================================================= */

async function updateAdminStats() {

  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  createAdminStatsPanel();

  addAdminStatsStyles();


  const members =
    await getMembers();


  const payments =
    await getAllPayments();


  const subscriptions =
    await getAllSubscriptions();


  const now =
    new Date();


  const thirtyDaysAgo =
    new Date();


  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );


  /* -----------------------------------------
     MEMBRES PREMIUM ACTIFS
  ----------------------------------------- */

  const activePremiumMembers =
    members.filter(member => {

      return subscriptions.some(
        subscription => {

          return (
            subscription.user_id ===
              member.id &&

            new Date(
              subscription.expires_at
            ) > now
          );

        }
      );

    });


  /* -----------------------------------------
     MEMBRES GRATUITS
  ----------------------------------------- */

  const freeMembers =
    members.filter(member => {

      return !activePremiumMembers.some(
        premiumMember =>
          premiumMember.id === member.id
      );

    });


  /* -----------------------------------------
     PREMIUM EXPIRÉS
  ----------------------------------------- */

  const expiredPremiums =
    members.filter(member => {

      return subscriptions.some(
        subscription => {

          return (
            subscription.user_id ===
              member.id &&

            new Date(
              subscription.expires_at
            ) <= now
          );

        }
      );

    });


  /* -----------------------------------------
     PAIEMENTS VÉRIFIÉS
  ----------------------------------------- */

  const verifiedPayments =
    payments.filter(
      payment =>
        payment.verified === true
    );


  /* -----------------------------------------
     PAIEMENTS DES 30 DERNIERS JOURS
  ----------------------------------------- */

  const payments30Days =
    verifiedPayments.filter(
      payment => {

        const paymentDate =
          new Date(
            payment.created_at
          );


        return (
          paymentDate >=
          thirtyDaysAgo
        );

      }
    );


  /* -----------------------------------------
     REVENUS
  ----------------------------------------- */

  const totalRevenue =
    verifiedPayments.reduce(
      (total, payment) => {

        return (
          total +
          Number(
            payment.amount || 0
          )
        );

      },
      0
    );


  const revenue30Days =
    payments30Days.reduce(
      (total, payment) => {

        return (
          total +
          Number(
            payment.amount || 0
          )
        );

      },
      0
    );


  /* -----------------------------------------
     MISE À JOUR AFFICHAGE
  ----------------------------------------- */

  if ($("statTotalMembers")) {

    $("statTotalMembers").textContent =
      members.length;
  }


  if ($("statPremiumActive")) {

    $("statPremiumActive").textContent =
      activePremiumMembers.length;
  }


  if ($("statFreeMembers")) {

    $("statFreeMembers").textContent =
      freeMembers.length;
  }


  if ($("statExpiredPremium")) {

    $("statExpiredPremium").textContent =
      expiredPremiums.length;
  }


  if ($("statVerifiedPayments")) {

    $("statVerifiedPayments").textContent =
      verifiedPayments.length;
  }


  if ($("statPayments30Days")) {

    $("statPayments30Days").textContent =
      payments30Days.length;
  }


  if ($("statSubscriptions")) {

    $("statSubscriptions").textContent =
      subscriptions.length;
  }


  if ($("statRevenue")) {

    $("statRevenue").textContent =
      totalRevenue.toLocaleString(
        "fr-FR"
      ) +
      " FCFA";
  }


  console.log(
    "WENDK — Statistiques admin actualisées",
    {
      totalMembers:
        members.length,

      premiumActive:
        activePremiumMembers.length,

      freeMembers:
        freeMembers.length,

      expiredPremium:
        expiredPremiums.length,

      verifiedPayments:
        verifiedPayments.length,

      payments30Days:
        payments30Days.length,

      subscriptions:
        subscriptions.length,

      revenue:
        totalRevenue,

      revenue30Days:
        revenue30Days
    }
  );
}


/* =========================================================
   49. INTÉGRATION AU DASHBOARD ADMIN
========================================================= */

const originalAdminDashboard =
  renderAdminDashboard;


renderAdminDashboard =
  async function () {

    await originalAdminDashboard();


    /*
      Laisser le temps au dashboard
      d'être affiché avant d'ajouter
      les statistiques.
    */

    setTimeout(
      async () => {

        await updateAdminStats();

      },
      100
    );

  };


/* =========================================================
   50. EXPORT
========================================================= */

window.createAdminStatsPanel =
  createAdminStatsPanel;

window.updateAdminStats =
  updateAdminStats;


/* =========================================================
   FIN STATISTIQUES ADMIN
========================================================= */
/* =========================================================
   WENDK PREDICT PRO V3
   AJOUTER UN MEMBRE ADMIN
========================================================= */


/* =========================================================
   51. CRÉER LE BOUTON
========================================================= */

function createAddMemberButton() {

  const dashboard =
    $("adminDashboard");

  if (!dashboard) {
    return;
  }


  if ($("wendkAddMemberButton")) {
    return;
  }


  const container =
    document.createElement("div");


  container.style.cssText = `
    margin:20px 0;
    display:flex;
    justify-content:flex-end;
  `;


  container.innerHTML = `

    <button
      id="wendkAddMemberButton"
      type="button"
      style="
        background:#111827;
        color:white;
        border:none;
        padding:13px 20px;
        border-radius:12px;
        font-weight:700;
        cursor:pointer;
        font-size:15px;
      "
    >
      ➕ Ajouter un membre
    </button>

  `;


  dashboard.prepend(
    container
  );


  $("wendkAddMemberButton")
    .addEventListener(
      "click",
      openAddMemberModal
    );
}


/* =========================================================
   52. MODALE AJOUT MEMBRE
========================================================= */

function createAddMemberModal() {

  if ($("wendkAddMemberModal")) {
    return;
  }


  const modal =
    document.createElement("div");


  modal.id =
    "wendkAddMemberModal";


  modal.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.65);
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    z-index:99999;
  `;


  modal.innerHTML = `

    <div
      style="
        width:100%;
        max-width:520px;
        max-height:90vh;
        overflow-y:auto;
        background:white;
        border-radius:18px;
        padding:24px;
        box-shadow:0 20px 60px rgba(0,0,0,.25);
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        "
      >

        <h2 style="margin:0;">
          ➕ Ajouter un membre
        </h2>

        <button
          id="closeAddMemberModal"
          type="button"
          style="
            border:none;
            background:#f1f5f9;
            width:38px;
            height:38px;
            border-radius:50%;
            font-size:20px;
            cursor:pointer;
          "
        >
          ×
        </button>

      </div>


      <form
        id="addMemberForm"
      >


        <label
          style="
            display:block;
            margin-bottom:6px;
            font-weight:700;
          "
        >
          Nom complet
        </label>

        <input
          id="newMemberName"
          type="text"
          placeholder="Ex : Jean Ouédraogo"
          required
          style="
            width:100%;
            box-sizing:border-box;
            padding:13px;
            margin-bottom:15px;
            border:1px solid #d1d5db;
            border-radius:10px;
          "
        >


        <label
          style="
            display:block;
            margin-bottom:6px;
            font-weight:700;
          "
        >
          WhatsApp
        </label>

        <input
          id="newMemberWhatsapp"
          type="tel"
          placeholder="+226 70 00 00 00"
          required
          style="
            width:100%;
            box-sizing:border-box;
            padding:13px;
            margin-bottom:15px;
            border:1px solid #d1d5db;
            border-radius:10px;
          "
        >


        <label
          style="
            display:block;
            margin-bottom:6px;
            font-weight:700;
          "
        >
          Email
        </label>

        <input
          id="newMemberEmail"
          type="email"
          placeholder="membre@email.com"
          required
          style="
            width:100%;
            box-sizing:border-box;
            padding:13px;
            margin-bottom:15px;
            border:1px solid #d1d5db;
            border-radius:10px;
          "
        >


        <label
          style="
            display:block;
            margin-bottom:6px;
            font-weight:700;
          "
        >
          Mot de passe
        </label>

        <input
          id="newMemberPassword"
          type="password"
          placeholder="Minimum 6 caractères"
          minlength="6"
          required
          style="
            width:100%;
            box-sizing:border-box;
            padding:13px;
            margin-bottom:15px;
            border:1px solid #d1d5db;
            border-radius:10px;
          "
        >


        <label
          style="
            display:block;
            margin-bottom:6px;
            font-weight:700;
          "
        >
          Statut
        </label>

        <select
          id="newMemberStatus"
          style="
            width:100%;
            box-sizing:border-box;
            padding:13px;
            margin-bottom:15px;
            border:1px solid #d1d5db;
            border-radius:10px;
            background:white;
          "
        >

          <option value="free">
            🆓 Gratuit
          </option>

          <option value="premium">
            💎 Premium
          </option>

        </select>


        <div
          id="premiumDaysContainer"
          style="
            display:none;
            margin-bottom:15px;
          "
        >

          <label
            style="
              display:block;
              margin-bottom:6px;
              font-weight:700;
            "
          >
            Durée Premium
          </label>

          <select
            id="newMemberPremiumDays"
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              border:1px solid #d1d5db;
              border-radius:10px;
              background:white;
            "
          >

            <option value="7">
              7 jours
            </option>

            <option value="30" selected>
              30 jours
            </option>

            <option value="90">
              90 jours
            </option>

            <option value="180">
              180 jours
            </option>

            <option value="365">
              365 jours
            </option>

          </select>

        </div>


        <div
          id="addMemberMessage"
          style="
            display:none;
            padding:12px;
            border-radius:10px;
            margin-bottom:15px;
            font-size:14px;
          "
        >
        </div>


        <button
          id="submitAddMember"
          type="submit"
          style="
            width:100%;
            padding:14px;
            border:none;
            border-radius:12px;
            background:#111827;
            color:white;
            font-weight:800;
            font-size:16px;
            cursor:pointer;
          "
        >
          👤 Créer le membre
        </button>


      </form>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  $("closeAddMemberModal")
    .addEventListener(
      "click",
      closeAddMemberModal
    );


  $("newMemberStatus")
    .addEventListener(
      "change",
      updatePremiumDaysVisibility
    );


  $("addMemberForm")
    .addEventListener(
      "submit",
      createMemberFromAdmin
    );


  modal.addEventListener(
    "click",
    function(event) {

      if (
        event.target === modal
      ) {

        closeAddMemberModal();

      }

    }
  );
}


/* =========================================================
   53. OUVRIR LA MODALE
========================================================= */

function openAddMemberModal() {

  createAddMemberModal();


  const modal =
    $("wendkAddMemberModal");


  if (!modal) {
    return;
  }


  modal.style.display =
    "flex";


  $("newMemberName").focus();
}


/* =========================================================
   54. FERMER LA MODALE
========================================================= */

function closeAddMemberModal() {

  const modal =
    $("wendkAddMemberModal");


  if (!modal) {
    return;
  }


  modal.style.display =
    "none";


  const form =
    $("addMemberForm");


  if (form) {
    form.reset();
  }


  updatePremiumDaysVisibility();


  const message =
    $("addMemberMessage");


  if (message) {

    message.style.display =
      "none";

    message.textContent =
      "";

  }

}


/* =========================================================
   55. AFFICHER DURÉE PREMIUM
========================================================= */

function updatePremiumDaysVisibility() {

  const status =
    $("newMemberStatus");


  const container =
    $("premiumDaysContainer");


  if (
    !status ||
    !container
  ) {
    return;
  }


  if (
    status.value ===
    "premium"
  ) {

    container.style.display =
      "block";

  } else {

    container.style.display =
      "none";

  }

}


/* =========================================================
   56. MESSAGE FORMULAIRE
========================================================= */

function showAddMemberMessage(
  message,
  type = "error"
) {

  const box =
    $("addMemberMessage");


  if (!box) {
    return;
  }


  box.textContent =
    message;


  box.style.display =
    "block";


  if (type === "success") {

    box.style.background =
      "#dcfce7";

    box.style.color =
      "#166534";

  } else {

    box.style.background =
      "#fee2e2";

    box.style.color =
      "#991b1b";

  }

}


/* =========================================================
   57. CRÉER LE MEMBRE
========================================================= */

async function createMemberFromAdmin(
  event
) {

  event.preventDefault();


  const auth =
    await requireAdmin();


  if (!auth) {
    return;
  }


  const name =
    $("newMemberName")
      .value
      .trim();


  const whatsapp =
    $("newMemberWhatsapp")
      .value
      .trim();


  const email =
    $("newMemberEmail")
      .value
      .trim()
      .toLowerCase();


  const password =
    $("newMemberPassword")
      .value;


  const status =
    $("newMemberStatus")
      .value;


  const premiumDays =
    Number(
      $("newMemberPremiumDays")
        .value || 30
    );


  if (!name) {

    showAddMemberMessage(
      "Veuillez entrer le nom."
    );

    return;

  }


  if (!whatsapp) {

    showAddMemberMessage(
      "Veuillez entrer le numéro WhatsApp."
    );

    return;

  }


  if (!email) {

    showAddMemberMessage(
      "Veuillez entrer l'email."
    );

    return;

  }


  if (
    password.length < 6
  ) {

    showAddMemberMessage(
      "Le mot de passe doit contenir au moins 6 caractères."
    );

    return;

  }


  const button =
    $("submitAddMember");


  button.disabled =
    true;


  button.textContent =
    "⏳ Création en cours...";


  showAddMemberMessage(
    "Création du compte...",
    "success"
  );


  try {

    const {
      data,
      error
    } =
      await supabase.functions.invoke(
        "create-member",
        {

          body: {

            name:
              name,

            whatsapp:
              whatsapp,

            email:
              email,

            password:
              password,

            status:
              status,

            premiumDays:
              premiumDays

          }

        }
      );


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.success !== true
    ) {

      throw new Error(
        data?.error ||
        "Impossible de créer le membre."
      );

    }


    showAddMemberMessage(
      data.message ||
      "Membre créé avec succès.",
      "success"
    );


    button.textContent =
      "✅ Membre créé";


    // Actualiser le dashboard

    setTimeout(
      async () => {

        closeAddMemberModal();


        await renderAdminDashboard();

      },
      1200
    );


  } catch (error) {

    console.error(
      "Erreur création membre:",
      error
    );


    showAddMemberMessage(

      error?.message ||
      "Une erreur est survenue lors de la création."

    );


    button.disabled =
      false;


    button.textContent =
      "👤 Créer le membre";

  }

}


/* =========================================================
   58. INTÉGRATION AU DASHBOARD
========================================================= */

const previousRenderAdminDashboard =
  renderAdminDashboard;


renderAdminDashboard =
  async function() {

    await previousRenderAdminDashboard();


    createAddMemberButton();

    createAddMemberModal();

    updatePremiumDaysVisibility();

  };


/* =========================================================
   59. EXPORT
========================================================= */

window.createAddMemberButton =
  createAddMemberButton;

window.openAddMemberModal =
  openAddMemberModal;

window.closeAddMemberModal =
  closeAddMemberModal;

window.createMemberFromAdmin =
  createMemberFromAdmin;


/* =========================================================
   FIN AJOUT MEMBRE ADMIN
========================================================= */
