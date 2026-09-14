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
