"use strict";

/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS — BLOC 1/3
   SUPABASE + AUTHENTIFICATION + PROFILS
========================================================= */


/* =========================================================
   1. CONNEXION SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://ujhghwjdecmuuqvllock.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_1luIJ43-R4_FXbjFuHrdiA_nLc5CEoO";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

console.log(
  "WENDK PREDICT PRO — Supabase connecté"
);


/* =========================================================
   2. CONFIGURATION
========================================================= */

const WHATSAPP_NUMBER =
  "22607309472";

const WHATSAPP_URL =
  "https://wa.me/" +
  WHATSAPP_NUMBER;


/* =========================================================
   3. OUTILS
========================================================= */

function formatDate(date) {

  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}


function formatDateTime(date) {

  if (!date) return "—";

  return new Date(date).toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showMessage(
  elementId,
  text,
  className = "success-message"
) {

  const element =
    document.getElementById(
      elementId
    );

  if (!element) return;

  element.className =
    className;

  element.textContent =
    text;
}


/* =========================================================
   4. NAVIGATION
========================================================= */

function showSection(sectionId) {

  document
    .querySelectorAll(".section")
    .forEach(section => {

      section.classList.remove(
        "active"
      );

    });


  const section =
    document.getElementById(
      sectionId
    );


  if (!section) return;


  section.classList.add(
    "active"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (
    sectionId ===
    "memberDashboard"
  ) {

    renderMemberDashboard();

  }


  if (
    sectionId ===
    "adminDashboard"
  ) {

    renderAdminDashboard();

  }


  if (
    sectionId ===
    "predictions"
  ) {

    renderPredictions();

  }

}


/* =========================================================
   5. UTILISATEUR SUPABASE ACTUEL
========================================================= */

async function getCurrentAuthUser() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getUser();


    if (error) {

      console.error(
        "Erreur utilisateur Supabase:",
        error
      );

      return null;

    }


    return data?.user || null;


  } catch (error) {

    console.error(
      "Erreur Auth:",
      error
    );

    return null;

  }

}


/* =========================================================
   6. RÉCUPÉRER LE PROFIL
========================================================= */

async function getProfile(
  userId
) {

  if (!userId) return null;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
          "id",
          userId
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Erreur profil:",
        error
      );

      return null;

    }


    return data || null;


  } catch (error) {

    console.error(
      "Erreur récupération profil:",
      error
    );

    return null;

  }

}


/* =========================================================
   7. RÉCUPÉRER L'UTILISATEUR COMPLET
========================================================= */

async function getCurrentUser() {

  const authUser =
    await getCurrentAuthUser();


  if (!authUser) {

    return null;

  }


  const profile =
    await getProfile(
      authUser.id
    );


  /*
    Si le profil existe :
    on combine Auth + profiles.
  */

  if (profile) {

    return {

      ...profile,

      email:
        authUser.email || ""

    };

  }


  /*
    Sécurité de secours :
    si le trigger n'a pas encore
    créé le profil.
  */

  return {

    id:
      authUser.id,

    name:
      authUser.user_metadata?.name ||
      "Membre",

    whatsapp:
      authUser.user_metadata?.whatsapp ||
      "",

    email:
      authUser.email || "",

    role:
      "member"

  };

}


/* =========================================================
   8. INSCRIPTION MEMBRE
========================================================= */

async function register(event) {

  event.preventDefault();


  const name =
    document
      .getElementById(
        "registerName"
      )
      .value
      .trim();


  const whatsapp =
    document
      .getElementById(
        "registerWhatsapp"
      )
      .value
      .trim();


  const email =
    document
      .getElementById(
        "registerEmail"
      )
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById(
        "registerPassword"
      )
      .value;


  const message =
    document.getElementById(
      "registerMessage"
    );


  if (
    !name ||
    !email ||
    !password
  ) {

    message.className =
      "error-message";

    message.textContent =
      "Veuillez remplir tous les champs obligatoires.";

    return;

  }


  if (
    password.length < 6
  ) {

    message.className =
      "error-message";

    message.textContent =
      "Le mot de passe doit contenir au moins 6 caractères.";

    return;

  }


  message.className =
    "success-message";

  message.textContent =
    "Création du compte en cours...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signUp({

          email:
            email,

          password:
            password,

          options: {

            data: {

              name:
                name,

              whatsapp:
                whatsapp

            }

          }

        });


    if (error) {

      console.error(
        "Erreur inscription:",
        error
      );

      message.className =
        "error-message";

      message.textContent =
        error.message ||
        "Impossible de créer le compte.";

      return;

    }


    if (!data?.user) {

      message.className =
        "error-message";

      message.textContent =
        "Le compte n'a pas pu être créé.";

      return;

    }


    /*
      Si Supabase retourne une session,
      l'utilisateur est immédiatement connecté.
    */

    if (data.session) {

      message.className =
        "success-message";

      message.textContent =
        "✅ Compte créé avec succès.";


      setTimeout(
        () => {

          showSection(
            "memberDashboard"
          );

        },
        700
      );

    } else {

      /*
        Si la confirmation email
        est activée dans Supabase.
      */

      message.className =
        "success-message";

      message.textContent =
        "✅ Compte créé. Vérifiez votre adresse email pour confirmer votre compte.";

    }


  } catch (error) {

    console.error(
      "Erreur inscription:",
      error
    );

    message.className =
      "error-message";

    message.textContent =
      "Une erreur est survenue lors de la création du compte.";

  }

}


/* =========================================================
   9. CONNEXION MEMBRE
========================================================= */

async function login(event) {

  event.preventDefault();


  const email =
    document
      .getElementById(
        "loginEmail"
      )
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      .value;


  const message =
    document.getElementById(
      "loginMessage"
    );


  if (
    !email ||
    !password
  ) {

    message.className =
      "error-message";

    message.textContent =
      "Veuillez saisir votre email et votre mot de passe.";

    return;

  }


  message.className =
    "success-message";

  message.textContent =
    "Connexion en cours...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email:
            email,

          password:
            password

        });


    if (error) {

      console.error(
        "Erreur connexion:",
        error
      );

      message.className =
        "error-message";

      message.textContent =
        "Email ou mot de passe incorrect.";

      return;

    }


    if (!data?.user) {

      message.className =
        "error-message";

      message.textContent =
        "Utilisateur introuvable.";

      return;

    }


    message.className =
      "success-message";

    message.textContent =
      "✅ Connexion réussie.";


    setTimeout(
      () => {

        showSection(
          "memberDashboard"
        );

      },
      500
    );


  } catch (error) {

    console.error(
      "Erreur connexion:",
      error
    );

    message.className =
      "error-message";

    message.textContent =
      "Une erreur est survenue lors de la connexion.";

  }

}


/* =========================================================
   10. DÉCONNEXION
========================================================= */

async function logout() {

  try {

    const {
      error
    } =
      await supabaseClient.auth
        .signOut();


    if (error) {

      console.error(
        "Erreur déconnexion:",
        error
      );

    }


  } catch (error) {

    console.error(
      "Erreur logout:",
      error
    );

  }


  showSection(
    "home"
  );

}


/* =========================================================
   11. ÉCOUTER LES CHANGEMENTS DE SESSION
========================================================= */

function listenAuthChanges() {

  supabaseClient.auth
    .onAuthStateChange(
      (
        event,
        session
      ) => {

        console.log(
          "Supabase Auth:",
          event
        );


        if (
          event ===
          "SIGNED_OUT"
        ) {

          showSection(
            "home"
          );

          return;

        }


        if (
          event ===
          "SIGNED_IN" ||
          event ===
          "TOKEN_REFRESHED"
        ) {

          renderPredictions();

        }

      }
    );

}


/* =========================================================
   12. INITIALISATION DU BLOC 1
========================================================= */

async function initAuth() {

  try {

    const user =
      await getCurrentUser();


    if (user) {

      console.log(
        "Membre connecté :",
        user.email
      );

    } else {

      console.log(
        "Aucun membre connecté."
      );

    }


    listenAuthChanges();


  } catch (error) {

    console.error(
      "Erreur initialisation Auth:",
      error
    );

  }

}
/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS — BLOC 2/3
   PREMIUM + PRÉDICTIONS + ESPACE MEMBRE
========================================================= */


/* =========================================================
   13. RÉCUPÉRER L'ABONNEMENT ACTIF
========================================================= */

async function getActiveSubscription(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erreur abonnement:", error);
      return null;
    }

    return data || null;

  } catch (error) {
    console.error("Erreur récupération abonnement:", error);
    return null;
  }
}


/* =========================================================
   14. VÉRIFIER LE PREMIUM
========================================================= */

async function checkPremiumStatus(userId) {
  const subscription = await getActiveSubscription(userId);

  if (!subscription) {
    return {
      premium: false,
      subscription: null,
      expiration: null
    };
  }

  const expiration = new Date(subscription.expires_at);
  const now = new Date();

  return {
    premium: expiration > now,
    subscription: subscription,
    expiration: subscription.expires_at
  };
}


/* =========================================================
   15. VÉRIFIER L'ACCÈS PREMIUM DE L'UTILISATEUR
========================================================= */

async function checkPremiumExpiration(user) {

  if (!user || !user.id) {
    return false;
  }

  const status = await checkPremiumStatus(user.id);

  if (status.premium) {
    return true;
  }

  return false;
}


/* =========================================================
   16. DONNÉES DES PRÉDICTIONS
========================================================= */

const predictions = [

  {
    id: 1,
    league: "Premier League",
    home: "Manchester United",
    away: "Chelsea",
    time: "18:00",
    free: "Double chance : 1X",
    premium: "Indication Premium : Manchester United ou nul + Plus de 1,5 buts"
  },

  {
    id: 2,
    league: "La Liga",
    home: "Real Madrid",
    away: "Barcelona",
    time: "20:00",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Plus de 2,5 buts"
  },

  {
    id: 3,
    league: "Serie A",
    home: "Inter Milan",
    away: "AC Milan",
    time: "19:45",
    free: "Double chance : 1X",
    premium: "Indication Premium : Inter Milan gagne"
  },

  {
    id: 4,
    league: "Ligue 1",
    home: "PSG",
    away: "Lyon",
    time: "21:00",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : PSG gagne + Plus de 2,5 buts"
  },

  {
    id: 5,
    league: "Bundesliga",
    home: "Bayern Munich",
    away: "Dortmund",
    time: "18:30",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Bayern Munich gagne"
  },

  {
    id: 6,
    league: "Premier League",
    home: "Liverpool",
    away: "Arsenal",
    time: "17:30",
    free: "Les deux équipes marquent",
    premium: "Indication Premium : Les deux équipes marquent + Plus de 2,5 buts"
  }

];


/* =========================================================
   17. AFFICHER LES PRÉDICTIONS
========================================================= */

async function renderPredictions() {

  const container = document.getElementById("predictionList");

  if (!container) return;

  const authUser = await getCurrentAuthUser();

  let isPremium = false;

  if (authUser) {
    isPremium = await checkPremiumExpiration({
      id: authUser.id
    });
  }

  container.innerHTML = "";

  predictions.forEach(prediction => {

    const card = document.createElement("div");

    card.className = "prediction-card";

    let premiumContent = "";

    if (isPremium) {

      premiumContent = `
        <div class="prediction-premium unlocked">
          <strong>⭐ INDICATION PREMIUM</strong>
          <p>
            ${escapeHTML(prediction.premium)}
          </p>
        </div>
      `;

    } else {

      premiumContent = `
        <div class="prediction-premium locked">

          <strong>🔒 INDICATION PREMIUM</strong>

          <p>
            Cette indication est réservée aux membres Premium.
          </p>

          <button
            type="button"
            onclick="openSubscriptionWhatsApp()"
            class="premium-button">
            🔓 ACTIVER PREMIUM
          </button>

        </div>
      `;
    }

    card.innerHTML = `

      <div class="prediction-header">

        <span class="prediction-league">
          ${escapeHTML(prediction.league)}
        </span>

        <span class="prediction-time">
          ${escapeHTML(prediction.time)}
        </span>

      </div>

      <div class="prediction-match">

        <div class="team">
          ${escapeHTML(prediction.home)}
        </div>

        <div class="vs">
          VS
        </div>

        <div class="team">
          ${escapeHTML(prediction.away)}
        </div>

      </div>

      <div class="prediction-free">

        <strong>🎯 Indication gratuite</strong>

        <p>
          ${escapeHTML(prediction.free)}
        </p>

      </div>

      ${premiumContent}

    `;

    container.appendChild(card);

  });

}


/* =========================================================
   18. WHATSAPP POUR SOUSCRIPTION
========================================================= */

function openSubscriptionWhatsApp() {

  const message =
    "Bonjour WENDK PREDICT PRO,%0A%0A" +
    "Je souhaite souscrire à l'abonnement Premium.%0A" +
    "Merci de m'indiquer les tarifs et les modalités de paiement Mobile Money.";

  window.open(
    WHATSAPP_URL + "?text=" + message,
    "_blank"
  );
}


/* =========================================================
   19. ESPACE MEMBRE
========================================================= */

async function renderMemberDashboard() {

  const user = await getCurrentUser();

  if (!user) {

    showSection("login");

    return;
  }

  const welcome =
    document.getElementById("memberWelcome");

  const status =
    document.getElementById("memberStatus");

  const expiration =
    document.getElementById("memberExpiration");

  const whatsapp =
    document.getElementById("memberWhatsapp");

  if (welcome) {

    welcome.textContent =
      "Bienvenue, " +
      (user.name || "Membre") +
      " 👋";

  }

  if (whatsapp) {

    whatsapp.textContent =
      user.whatsapp || "Non renseigné";

  }


  /* =====================================================
     VÉRIFICATION PREMIUM
  ===================================================== */

  const premium =
    await checkPremiumStatus(user.id);


  if (premium.premium) {

    if (status) {

      status.innerHTML =
        `<span class="premium-status">
          ⭐ PREMIUM ACTIF
        </span>`;

    }

    if (expiration) {

      expiration.textContent =
        "Expire le : " +
        formatDate(premium.expiration);

    }

  } else {

    if (status) {

      status.innerHTML =
        `<span class="free-status">
          🔒 COMPTE GRATUIT
        </span>`;

    }

    if (expiration) {

      expiration.textContent =
        "Aucun abonnement Premium actif.";

    }

  }


  /* =====================================================
     HISTORIQUE DES ABONNEMENTS
  ===================================================== */

  await renderMemberHistory(user.id);

}


/* =========================================================
   20. HISTORIQUE PREMIUM DU MEMBRE
========================================================= */

async function renderMemberHistory(userId) {

  const container =
    document.getElementById("memberHistory");

  if (!container) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Erreur historique:",
        error
      );

      container.innerHTML =
        "<p>Impossible de charger l'historique.</p>";

      return;
    }


    if (!data || data.length === 0) {

      container.innerHTML =
        "<p>Aucun abonnement enregistré.</p>";

      return;
    }


    container.innerHTML = `

      <h3>📋 Historique Premium</h3>

      ${data.map(item => `

        <div class="history-item">

          <strong>
            ${escapeHTML(
              item.action || "Abonnement"
            )}
          </strong>

          <p>
            Durée :
            ${escapeHTML(item.days || 0)}
            jour(s)
          </p>

          <p>
            Début :
            ${formatDate(item.start_at)}
          </p>

          <p>
            Expiration :
            ${formatDate(item.expires_at)}
          </p>

          <small>
            Enregistré le
            ${formatDateTime(item.created_at)}
          </small>

        </div>

      `).join("")}

    `;

  } catch (error) {

    console.error(
      "Erreur historique:",
      error
    );

    container.innerHTML =
      "<p>Erreur lors du chargement.</p>";
  }

}


/* =========================================================
   21. ENVOYER UNE DEMANDE DE PAIEMENT
========================================================= */

async function submitPaymentRequest() {

  const user =
    await getCurrentUser();

  if (!user) {

    showSection("login");

    return;
  }


  const amount =
    parseInt(
      document.getElementById("paymentAmount")?.value || 0
    );

  const method =
    document.getElementById("paymentMethod")?.value ||
    "Mobile Money";

  const reference =
    document.getElementById("paymentReference")?.value.trim() ||
    "Non fournie";

  const note =
    document.getElementById("paymentNote")?.value.trim() ||
    "";


  if (!amount || amount <= 0) {

    showMessage(
      "adminActionMessage",
      "Veuillez saisir un montant valide.",
      "error-message"
    );

    return;
  }


  try {

    const { data, error } =
      await supabaseClient
        .from("payments")
        .insert({

          user_id: user.id,

          amount: amount,

          method: method,

          reference: reference,

          note: note,

          verified: false

        })
        .select()
        .single();


    if (error) {

      console.error(
        "Erreur paiement:",
        error
      );

      showMessage(
        "adminActionMessage",
        "Impossible d'enregistrer le paiement.",
        "error-message"
      );

      return;
    }


    showMessage(
      "adminActionMessage",
      "✅ Paiement enregistré. Il sera vérifié par l'administration.",
      "success-message"
    );


    return data;

  } catch (error) {

    console.error(
      "Erreur paiement:",
      error
    );

    showMessage(
      "adminActionMessage",
      "Une erreur est survenue.",
      "error-message"
    );

  }

}


/* =========================================================
   22. RÉCUPÉRER LES PAIEMENTS DU MEMBRE
========================================================= */

async function getMemberPayments(userId) {

  if (!userId) return [];

  try {

    const { data, error } =
      await supabaseClient
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Erreur paiements:",
        error
      );

      return [];
    }

    return data || [];

  } catch (error) {

    console.error(
      "Erreur récupération paiements:",
      error
    );

    return [];
  }

}


/* =========================================================
   23. RAFRAÎCHIR LES PRÉDICTIONS APRÈS CONNEXION
========================================================= */

async function refreshPremiumAccess() {

  const user =
    await getCurrentUser();

  if (!user) {

    await renderPredictions();

    return;
  }

  await checkPremiumExpiration(user);

  await renderPredictions();

  if (
    document.getElementById("memberDashboard")
      ?.classList.contains("active")
  ) {

    await renderMemberDashboard();

  }

}


/* =========================================================
   24. FORMULAIRE DE PAIEMENT MEMBRE
========================================================= */

function openPaymentWhatsApp() {

  const userMessage =
    "Bonjour WENDK PREDICT PRO,%0A%0A" +
    "Je viens d'effectuer mon paiement Mobile Money " +
    "pour l'abonnement Premium.%0A%0A" +
    "Nom : " +
    encodeURIComponent(
      document.getElementById("registerName")?.value || ""
    ) +
    "%0A%0A" +
    "Je vais envoyer la preuve de paiement ici.";

  window.open(
    WHATSAPP_URL +
    "?text=" +
    userMessage,
    "_blank"
  );

}


/* =========================================================
   25. INITIALISATION DU BLOC 2
========================================================= */

async function initPremiumSystem() {

  try {

    const user =
      await getCurrentUser();

    if (user) {

      await checkPremiumExpiration(user);

    }

    await renderPredictions();

  } catch (error) {

    console.error(
      "Erreur système Premium:",
      error
    );

  }

   }
/* =========================================================
   WENDK PREDICT PRO V3
   SCRIPT.JS — BLOC 3/3
   ADMINISTRATION + PAIEMENTS + PREMIUM
========================================================= */


/* =========================================================
   26. VÉRIFIER SI L'UTILISATEUR EST ADMIN
========================================================= */

async function isAdmin() {

  const user = await getCurrentUser();

  if (!user || !user.id) {
    return false;
  }

  try {

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erreur vérification admin:", error);
      return false;
    }

    return data?.role === "admin";

  } catch (error) {

    console.error("Erreur admin:", error);

    return false;
  }
}


/* =========================================================
   27. CONNEXION ADMIN
========================================================= */

async function adminLogin(event) {

  event.preventDefault();

  const username =
    document.getElementById("adminUsername")?.value.trim();

  const password =
    document.getElementById("adminPassword")?.value;

  const message =
    document.getElementById("adminLoginMessage");


  if (!username || !password) {

    showMessage(
      "adminLoginMessage",
      "Veuillez remplir tous les champs.",
      "error-message"
    );

    return;
  }


  if (message) {

    message.className = "success-message";
    message.textContent = "Connexion administrateur...";

  }


  try {

    /*
     * Le champ adminUsername accepte l'adresse
     * email du compte administrateur Supabase.
     */

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({

        email: username.toLowerCase(),

        password: password

      });


    if (error) {

      console.error(
        "Erreur connexion admin:",
        error
      );

      showMessage(
        "adminLoginMessage",
        "Identifiants administrateur incorrects.",
        "error-message"
      );

      return;
    }


    if (!data?.user) {

      showMessage(
        "adminLoginMessage",
        "Compte administrateur introuvable.",
        "error-message"
      );

      return;
    }


    const admin =
      await getCurrentUser();


    if (!admin || admin.role !== "admin") {

      await supabaseClient.auth.signOut();

      showMessage(
        "adminLoginMessage",
        "⛔ Ce compte n'a pas les droits administrateur.",
        "error-message"
      );

      return;
    }


    showMessage(
      "adminLoginMessage",
      "✅ Connexion administrateur réussie.",
      "success-message"
    );


    setTimeout(() => {

      showSection("adminDashboard");

    }, 500);


  } catch (error) {

    console.error(
      "Erreur admin login:",
      error
    );

    showMessage(
      "adminLoginMessage",
      "Une erreur est survenue.",
      "error-message"
    );

  }

}


/* =========================================================
   28. DÉCONNEXION ADMIN
========================================================= */

async function adminLogout() {

  try {

    await supabaseClient.auth.signOut();

  } catch (error) {

    console.error(
      "Erreur déconnexion admin:",
      error
    );

  }

  showSection("home");
}


/* =========================================================
   29. CHARGER LES MEMBRES
========================================================= */

async function getAllMembers() {

  try {

    const { data, error } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .order("created_at", {
          ascending: false
        });


    if (error) {

      console.error(
        "Erreur membres:",
        error
      );

      return [];

    }


    return data || [];


  } catch (error) {

    console.error(
      "Erreur récupération membres:",
      error
    );

    return [];

  }

}


/* =========================================================
   30. CHARGER LES PAIEMENTS
========================================================= */

async function getAllPayments() {

  try {

    const { data, error } =
      await supabaseClient
        .from("payments")
        .select(`
          *,
          profiles!payments_user_id_fkey(
            id,
            name,
            whatsapp
          )
        `)
        .order("created_at", {
          ascending: false
        });


    if (error) {

      console.error(
        "Erreur paiements admin:",
        error
      );

      return [];

    }


    return data || [];


  } catch (error) {

    console.error(
      "Erreur récupération paiements:",
      error
    );

    return [];

  }

}


/* =========================================================
   31. CALCULER LE NOMBRE DE MEMBRES PREMIUM
========================================================= */

async function countPremiumMembers(members) {

  let premiumCount = 0;

  for (const member of members) {

    if (member.role === "admin") {
      continue;
    }

    const subscription =
      await getActiveSubscription(member.id);

    if (subscription) {
      premiumCount++;
    }

  }

  return premiumCount;
}


/* =========================================================
   32. AFFICHER LE TABLEAU DE BORD ADMIN
========================================================= */

async function renderAdminDashboard() {

  const admin =
    await getCurrentUser();


  if (!admin || admin.role !== "admin") {

    showSection("adminLogin");

    return;

  }


  const members =
    await getAllMembers();

  const payments =
    await getAllPayments();


  const premiumCount =
    await countPremiumMembers(members);


  const memberCount =
    members.filter(
      member => member.role !== "admin"
    ).length;


  const verifiedPayments =
    payments.filter(
      payment => payment.verified === true
    ).length;


  const premiumElement =
    document.getElementById("premiumMembers");

  const totalMembersElement =
    document.getElementById("totalMembers");

  const expiredElement =
    document.getElementById("expiredMembers");

  const totalPaymentsElement =
    document.getElementById("totalPayments");


  if (totalMembersElement) {

    totalMembersElement.textContent =
      memberCount;

  }


  if (premiumElement) {

    premiumElement.textContent =
      premiumCount;

  }


  if (totalPaymentsElement) {

    totalPaymentsElement.textContent =
      verifiedPayments;

  }


  if (expiredElement) {

    expiredElement.textContent =
      Math.max(
        0,
        memberCount - premiumCount
      );

  }


  await renderAdminMembers(members);

  await renderAdminPayments(payments);

}


/* =========================================================
   33. AFFICHER LES MEMBRES DANS L'ADMIN
========================================================= */

async function renderAdminMembers(members = null) {

  const container =
    document.getElementById("adminMembers");

  if (!container) return;


  if (!members) {

    members =
      await getAllMembers();

  }


  const searchInput =
    document.getElementById("memberSearch");

  const search =
    searchInput?.value.trim().toLowerCase() || "";


  let filtered =
    members.filter(member => {

      if (member.role === "admin") {
        return false;
      }


      if (!search) {
        return true;
      }


      return (

        String(member.name || "")
          .toLowerCase()
          .includes(search)

        ||

        String(member.whatsapp || "")
          .toLowerCase()
          .includes(search)

        ||

        String(member.id || "")
          .toLowerCase()
          .includes(search)

      );

    });


  if (filtered.length === 0) {

    container.innerHTML =
      "<p>Aucun membre trouvé.</p>";

    return;

  }


  let html = `

    <div class="admin-list">

      <h3>👥 Membres</h3>

  `;


  for (const member of filtered) {

    const premium =
      await getActiveSubscription(member.id);


    const premiumStatus =
      premium

        ? `
          <span class="premium-status">
            ⭐ PREMIUM
          </span>
        `

        : `
          <span class="free-status">
            GRATUIT
          </span>
        `;


    html += `

      <div class="admin-member-item">

        <div class="member-info">

          <strong>
            ${escapeHTML(
              member.name || "Membre"
            )}
          </strong>

          <p>
            WhatsApp :
            ${escapeHTML(
              member.whatsapp || "Non renseigné"
            )}
          </p>

          <p>
            Inscription :
            ${formatDate(
              member.created_at
            )}
          </p>

          ${premiumStatus}

          ${
            premium
              ? `
                <p>
                  Expire le :
                  <strong>
                    ${formatDate(
                      premium.expires_at
                    )}
                  </strong>
                </p>
              `
              : ""
          }

        </div>


        <div class="member-actions">

          <button
            type="button"
            onclick="openAdminMemberModal('${member.id}')">
            ⚙️ Gérer
          </button>

        </div>

      </div>

    `;

  }


  html += `

    </div>

  `;


  container.innerHTML = html;

}


/* =========================================================
   34. RECHERCHE DES MEMBRES
========================================================= */

function searchMembers() {

  renderAdminMembers();

}


/* =========================================================
   35. AFFICHER LES PAIEMENTS ADMIN
========================================================= */

async function renderAdminPayments(payments = null) {

  const container =
    document.getElementById("adminPayments");

  if (!container) return;


  if (!payments) {

    payments =
      await getAllPayments();

  }


  if (!payments || payments.length === 0) {

    container.innerHTML =
      "<p>Aucun paiement enregistré.</p>";

    return;

  }


  let html = `

    <div class="admin-list">

      <h3>💰 Paiements</h3>

  `;


  payments.forEach(payment => {

    const member =
      payment.profiles || {};


    const status =
      payment.verified

        ? `
          <span class="premium-status">
            ✅ VÉRIFIÉ
          </span>
        `

        : `
          <span class="free-status">
            ⏳ EN ATTENTE
          </span>
        `;


    html += `

      <div class="admin-payment-item">

        <div>

          <strong>
            ${escapeHTML(
              member.name || "Membre"
            )}
          </strong>

          <p>
            WhatsApp :
            ${escapeHTML(
              member.whatsapp || "Non renseigné"
            )}
          </p>

          <p>
            Montant :
            <strong>
              ${Number(
                payment.amount || 0
              ).toLocaleString("fr-FR")}
              FCFA
            </strong>
          </p>

          <p>
            Méthode :
            ${escapeHTML(
              payment.method || "Mobile Money"
            )}
          </p>

          <p>
            Référence :
            ${escapeHTML(
              payment.reference || "Non fournie"
            )}
          </p>

          <p>
            Date :
            ${formatDateTime(
              payment.created_at
            )}
          </p>

          ${status}

        </div>


        <div class="payment-actions">

          ${
            payment.verified

              ? `

                <button
                  type="button"
                  onclick="openAdminMemberModal('${payment.user_id}')">
                  ⚙️ Gérer Premium
                </button>

              `

              : `

                <button
                  type="button"
                  onclick="verifyPayment('${payment.id}')">
                  ✅ Vérifier
                </button>

                <button
                  type="button"
                  onclick="openAdminMemberModal('${payment.user_id}')">
                  ⭐ Activer Premium
                </button>

              `
          }

        </div>

      </div>

    `;

  });


  html += `

    </div>

  `;


  container.innerHTML = html;

}


/* =========================================================
   36. OUVRIR LA FENÊTRE ADMIN D'UN MEMBRE
========================================================= */

async function openAdminMemberModal(userId) {

  const admin =
    await getCurrentUser();


  if (!admin || admin.role !== "admin") {

    alert(
      "Accès administrateur requis."
    );

    return;

  }


  const member =
    await getProfile(userId);


  if (!member) {

    alert(
      "Membre introuvable."
    );

    return;

  }


  const modal =
    document.getElementById("adminModal");


  if (!modal) {

    console.error(
      "adminModal introuvable dans le HTML."
    );

    return;

  }


  const info =
    document.getElementById("selectedMemberInfo");


  if (info) {

    info.innerHTML = `

      <strong>
        ${escapeHTML(
          member.name || "Membre"
        )}
      </strong>

      <p>
        WhatsApp :
        ${escapeHTML(
          member.whatsapp || "Non renseigné"
        )}
      </p>

      <p>
        ID :
        ${escapeHTML(member.id)}
      </p>

    `;

  }


  const memberIdField =
    document.getElementById("paymentMemberId");


  if (memberIdField) {

    memberIdField.value =
      member.id;

  }


  const subscription =
    await getActiveSubscription(member.id);


  const durationField =
    document.getElementById("premiumDuration");

  const customDaysField =
    document.getElementById("customDays");


  if (durationField) {

    durationField.value =
      subscription ? "30" : "30";

  }


  if (customDaysField) {

    customDaysField.value = "";

  }


  const actionMessage =
    document.getElementById("adminActionMessage");


  if (actionMessage) {

    actionMessage.textContent = "";

  }


  modal.classList.add("active");

  modal.style.display = "flex";

}


/* =========================================================
   37. FERMER LA FENÊTRE ADMIN
========================================================= */

function closeAdminModal() {

  const modal =
    document.getElementById("adminModal");

  if (!modal) return;


  modal.classList.remove("active");

  modal.style.display = "none";

}


/* =========================================================
   38. OBTENIR LE NOMBRE DE JOURS PREMIUM
========================================================= */

function getPremiumDays() {

  const duration =
    document.getElementById("premiumDuration");

  const custom =
    document.getElementById("customDays");


  const selected =
    duration?.value || "";


  if (selected === "custom") {

    const days =
      parseInt(
        custom?.value || 0
      );

    return days;

  }


  const days =
    parseInt(selected);


  return Number.isFinite(days)
    ? days
    : 0;

}


/* =========================================================
   39. ACTIVER / PROLONGER PREMIUM
========================================================= */

async function activatePremium() {

  const admin =
    await getCurrentUser();


  if (!admin || admin.role !== "admin") {

    showMessage(
      "adminActionMessage",
      "⛔ Accès administrateur requis.",
      "error-message"
    );

    return;

  }


  const userId =
    document.getElementById(
      "paymentMemberId"
    )?.value;


  if (!userId) {

    showMessage(
      "adminActionMessage",
      "Membre introuvable.",
      "error-message"
    );

    return;

  }


  const days =
    getPremiumDays();


  if (!days || days <= 0) {

    showMessage(
      "adminActionMessage",
      "Veuillez choisir une durée Premium valide.",
      "error-message"
    );

    return;

  }


  try {

    const now =
      new Date();


    const current =
      await getActiveSubscription(userId);


    let startDate =
      now;


    let expirationDate;


    /*
     * Si le membre possède encore un Premium actif,
     * on ajoute les nouveaux jours à son expiration.
     */

    if (current) {

      const currentExpiration =
        new Date(
          current.expires_at
        );


      startDate =
        currentExpiration;


      expirationDate =
        new Date(
          currentExpiration.getTime() +
          days * 24 * 60 * 60 * 1000
        );

    } else {

      expirationDate =
        new Date(
          now.getTime() +
          days * 24 * 60 * 60 * 1000
        );

    }


    const { data, error } =
      await supabaseClient
        .from("subscriptions")
        .insert({

          user_id: userId,

          start_at:
            startDate.toISOString(),

          expires_at:
            expirationDate.toISOString(),

          days: days,

          action:
            current
              ? "Prolongation Premium"
              : "Activation Premium",

          created_by:
            admin.id

        })
        .select()
        .single();


    if (error) {

      console.error(
        "Erreur activation Premium:",
        error
      );

      showMessage(
        "adminActionMessage",
        "❌ Impossible d'activer le Premium.",
        "error-message"
      );

      return;

    }


    showMessage(
      "adminActionMessage",
      "✅ Premium activé jusqu'au " +
      formatDate(
        expirationDate
      ) +
      ".",
      "success-message"
    );


    await renderAdminDashboard();

    await renderPredictions();


    setTimeout(() => {

      closeAdminModal();

    }, 1200);


    return data;


  } catch (error) {

    console.error(
      "Erreur Premium:",
      error
    );

    showMessage(
      "adminActionMessage",
      "Une erreur est survenue.",
      "error-message"
    );

  }

}


/* =========================================================
   40. VÉRIFIER UN PAIEMENT
========================================================= */

async function verifyPayment(paymentId) {

  const admin =
    await getCurrentUser();


  if (!admin || admin.role !== "admin") {

    alert(
      "Accès administrateur requis."
    );

    return;

  }


  if (!paymentId) {

    return;

  }


  const confirmation =
    confirm(
      "Confirmer la vérification de ce paiement ?"
    );


  if (!confirmation) {

    return;

  }


  try {

    const { error } =
      await supabaseClient
        .from("payments")
        .update({

          verified: true,

          verified_by: admin.id

        })
        .eq("id", paymentId);


    if (error) {

      console.error(
        "Erreur vérification paiement:",
        error
      );

      alert(
        "Impossible de vérifier le paiement."
      );

      return;

    }


    alert(
      "✅ Paiement vérifié avec succès."
    );


    await renderAdminDashboard();


  } catch (error) {

    console.error(
      "Erreur paiement:",
      error
    );

    alert(
      "Une erreur est survenue."
    );

  }

}


/* =========================================================
   41. DÉSACTIVER LE PREMIUM
========================================================= */

async function deactivatePremium(userId) {

  const admin =
    await getCurrentUser();


  if (!admin || admin.role !== "admin") {

    alert(
      "Accès administrateur requis."
    );

    return;

  }


  if (!userId) {

    userId =
      document.getElementById(
        "paymentMemberId"
      )?.value;

  }


  if (!userId) {

    return;

  }


  const confirmation =
    confirm(
      "Voulez-vous désactiver le Premium de ce membre ?"
    );


  if (!confirmation) {

    return;

  }


  try {

    /*
     * On ne supprime pas l'historique.
     * On expire simplement l'abonnement actif.
     
