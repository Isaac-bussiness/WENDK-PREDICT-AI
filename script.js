"use strict";
/* =========================================================
   CONNEXION SUPABASE — WENDK PREDICT PRO
========================================================= */

const SUPABASE_URL = "https://ujhghwjdecmuuqvllock.supabase.co";

const SUPABASE_KEY = "sb_publishable_1luIJ43-R4_FXbjFuHrdiA_nLc5CEoO";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("WENDK PREDICT PRO — Supabase connecté");

/* =========================================================
   WENDK PREDICT PRO V3
   ESPACE MEMBRE + ADMIN + PREMIUM
========================================================= */

const WHATSAPP_NUMBER = "22607309472";
const WHATSAPP_URL = "https://wa.me/" + WHATSAPP_NUMBER;


/* =========================================================
   CONFIGURATION ADMIN
========================================================= */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "WENDK2026";


/* =========================================================
   CLÉS LOCALSTORAGE
========================================================= */

const USERS_KEY = "wendkPredictUsers";
const PAYMENTS_KEY = "wendkPredictPayments";
const CURRENT_USER_KEY = "wendkPredictCurrentUser";
const ADMIN_SESSION_KEY = "wendkPredictAdminSession";


/* =========================================================
   OUTILS
========================================================= */

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getPayments() {
  return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || "[]");
}

function savePayments(payments) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

function generateId(prefix = "id") {
  return prefix + "_" + Date.now() + "_" +
    Math.random().toString(36).substring(2, 8);
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(sectionId) {

  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (!section) return;

  section.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (sectionId === "memberDashboard") {
    renderMemberDashboard();
  }

  if (sectionId === "adminDashboard") {

    if (!isAdminLogged()) {
      showSection("adminLogin");
      return;
    }

    renderAdminDashboard();
  }

  if (sectionId === "predictions") {
    renderPredictions();
  }
}


/* =========================================================
   INSCRIPTION
========================================================= */

function register(event) {

  event.preventDefault();

  const name =
    document.getElementById("registerName").value.trim();

  const whatsapp =
    document.getElementById("registerWhatsapp").value.trim();

  const email =
    document.getElementById("registerEmail")
      .value.trim()
      .toLowerCase();

  const password =
    document.getElementById("registerPassword").value;

  const message =
    document.getElementById("registerMessage");

  const users = getUsers();

  const existing =
    users.find(user => user.email === email);

  if (existing) {

    message.className = "error-message";

    message.textContent =
      "Un compte existe déjà avec cet email.";

    return;
  }

  const user = {

    id: generateId("user"),

    name,

    whatsapp,

    email,

    password,

    premium: false,

    premiumExpiresAt: null,

    createdAt: new Date().toISOString(),

    subscriptionHistory: []

  };

  users.push(user);

  saveUsers(users);

  localStorage.setItem(
    CURRENT_USER_KEY,
    user.id
  );

  message.className = "success-message";

  message.textContent =
    "Compte créé avec succès.";

  setTimeout(() => {
    showSection("memberDashboard");
  }, 700);
}


/* =========================================================
   CONNEXION MEMBRE
========================================================= */

function login(event) {

  event.preventDefault();

  const email =
    document.getElementById("loginEmail")
      .value.trim()
      .toLowerCase();

  const password =
    document.getElementById("loginPassword").value;

  const message =
    document.getElementById("loginMessage");

  const users = getUsers();

  const user =
    users.find(
      u =>
        u.email === email &&
        u.password === password
    );

  if (!user) {

    message.className = "error-message";

    message.textContent =
      "Email ou mot de passe incorrect.";

    return;
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    user.id
  );

  message.className =
    "success-message";

  message.textContent =
    "Connexion réussie.";

  setTimeout(() => {
    showSection("memberDashboard");
  }, 500);
}


/* =========================================================
   UTILISATEUR COURANT
========================================================= */

function getCurrentUser() {

  const id =
    localStorage.getItem(
      CURRENT_USER_KEY
    );

  if (!id) return null;

  const users = getUsers();

  return users.find(
    user => user.id === id
  ) || null;
}


/* =========================================================
   VÉRIFICATION EXPIRATION
========================================================= */

function checkPremiumExpiration(user) {

  if (!user) return null;

  if (
    user.premium &&
    user.premiumExpiresAt &&
    new Date(user.premiumExpiresAt).getTime()
      <= Date.now()
  ) {

    user.premium = false;

    user.premiumExpiredAt =
      new Date().toISOString();

    const users = getUsers();

    const index =
      users.findIndex(
        u => u.id === user.id
      );

    if (index !== -1) {

      users[index] = user;

      saveUsers(users);
    }
  }

  return user;
}


/* =========================================================
   DASHBOARD MEMBRE
========================================================= */

function renderMemberDashboard() {

  let user = getCurrentUser();

  if (!user) {

    showSection("login");

    return;
  }

  user = checkPremiumExpiration(user);

  document.getElementById(
    "memberWelcome"
  ).textContent =
    "Bienvenue, " + user.name;

  document.getElementById(
    "memberWhatsapp"
  ).textContent =
    user.whatsapp || "—";

  const status =
    document.getElementById(
      "memberStatus"
    );

  if (user.premium) {

    status.textContent =
      "PREMIUM";

    status.style.color =
      "#f5c542";

    document.getElementById(
      "memberExpiration"
    ).textContent =
      formatDate(
        user.premiumExpiresAt
      );

  } else {

    status.textContent =
      "GRATUIT";

    status.style.color =
      "#ff4d67";

    document.getElementById(
      "memberExpiration"
    ).textContent =
      "Non actif";
  }

  renderMemberHistory(user);
}


/* =========================================================
   HISTORIQUE MEMBRE
========================================================= */

function renderMemberHistory(user) {

  const container =
    document.getElementById(
      "memberHistory"
    );

  const history =
    user.subscriptionHistory || [];

  if (!history.length) {

    container.innerHTML =
      `<p style="color:#9eafc3">
        Aucun abonnement enregistré pour le moment.
      </p>`;

    return;
  }

  container.innerHTML =
    history
      .slice()
      .reverse()
      .map(item => {

        return `
          <div class="history-item">

            <strong>
              ${escapeHTML(item.action)}
            </strong>

            <p>
              Durée :
              ${escapeHTML(item.days)}
              jours
            </p>

            <p>
              Date :
              ${formatDateTime(item.date)}
            </p>

            <p>
              Nouvelle expiration :
              ${formatDate(item.expiresAt)}
            </p>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   WHATSAPP
========================================================= */

function contactWhatsApp() {

  const user = getCurrentUser();

  let message =
    "Bonjour WENDK PREDICT PRO.%0A%0A" +
    "Je souhaite souscrire / renouveler mon abonnement Premium.";

  if (user) {

    message +=
      "%0A%0ANom : " +
      encodeURIComponent(user.name) +

      "%0AEmail : " +
      encodeURIComponent(user.email) +

      "%0AWhatsApp : " +
      encodeURIComponent(user.whatsapp);
  }

  window.open(
    WHATSAPP_URL + "?text=" + message,
    "_blank"
  );
}


/* =========================================================
   DÉCONNEXION MEMBRE
========================================================= */

function logout() {

  localStorage.removeItem(
    CURRENT_USER_KEY
  );

  showSection("home");
    }
/* =========================================================
   PRÉDICTIONS
========================================================= */

const predictions = [

  {
    match: "Real Madrid vs Barcelona",
    league: "Liga",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Victoire Real Madrid"
  },

  {
    match: "Manchester City vs Arsenal",
    league: "Premier League",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Plus de 2,5 buts"
  },

  {
    match: "PSG vs Marseille",
    league: "Ligue 1",
    free: "PSG ou nul",
    premium: "Indication Premium : PSG gagne"
  },

  {
    match: "Bayern Munich vs Dortmund",
    league: "Bundesliga",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Bayern gagne"
  },

  {
    match: "Liverpool vs Chelsea",
    league: "Premier League",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Liverpool ou nul"
  },

  {
    match: "Inter Milan vs AC Milan",
    league: "Serie A",
    free: "Plus de 1,5 buts",
    premium: "Indication Premium : Inter Milan gagne"
  }

];


/* =========================================================
   AFFICHAGE DES PRÉDICTIONS
========================================================= */

function renderPredictions() {

  const container =
    document.getElementById("predictionList");

  if (!container) return;

  const currentUser =
    getCurrentUser();

  let isPremium = false;

  if (currentUser) {

    const user =
      checkPremiumExpiration(currentUser);

    isPremium =
      user && user.premium === true;
  }

  container.innerHTML =
    predictions.map(prediction => {

      return `
        <article class="prediction-card">

          <span class="badge">
            ${escapeHTML(prediction.league)}
          </span>

          <h3>
            ${escapeHTML(prediction.match)}
          </h3>

          <div class="prediction-line">

            <span>
              Indication gratuite
            </span>

            <strong class="free-indication">
              ${escapeHTML(prediction.free)}
            </strong>

          </div>

          <div class="prediction-line">

            <span>
              Premium
            </span>

            <strong class="${
              isPremium
                ? "free-indication"
                : "premium-indication"
            }">

              ${escapeHTML(prediction.premium)}

            </strong>

          </div>

          ${
            !isPremium
              ? `
                <div class="lock-message">

                  🔒 Indication réservée
                  aux membres Premium.

                  <br><br>

                  <button
                    class="btn primary"
                    onclick="showSection('login')">

                    🔐 Se connecter

                  </button>

                </div>
              `
              : ""
          }

        </article>
      `;

    }).join("");
}


/* =========================================================
   ADMIN — VÉRIFICATION DE SESSION
========================================================= */

function isAdminLogged() {

  return (
    localStorage.getItem(
      ADMIN_SESSION_KEY
    ) === "true"
  );
}


/* =========================================================
   CONNEXION ADMIN
========================================================= */

function adminLogin(event) {

  event.preventDefault();

  const username =
    document.getElementById(
      "adminUsername"
    ).value.trim();

  const password =
    document.getElementById(
      "adminPassword"
    ).value;

  const message =
    document.getElementById(
      "adminLoginMessage"
    );

  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {

    localStorage.setItem(
      ADMIN_SESSION_KEY,
      "true"
    );

    message.className =
      "success-message";

    message.textContent =
      "Connexion administrateur réussie.";

    setTimeout(() => {

      showSection(
        "adminDashboard"
      );

    }, 500);

  } else {

    message.className =
      "error-message";

    message.textContent =
      "Identifiant ou mot de passe incorrect.";
  }
}


/* =========================================================
   DÉCONNEXION ADMIN
========================================================= */

function adminLogout() {

  localStorage.removeItem(
    ADMIN_SESSION_KEY
  );

  showSection("home");
}


/* =========================================================
   TABLEAU DE BORD ADMIN
========================================================= */

function renderAdminDashboard() {

  if (!isAdminLogged()) {

    showSection("adminLogin");

    return;
  }

  let users =
    getUsers();

  const payments =
    getPayments();


  /*
    Vérification automatique
    de l'expiration Premium.
  */

  users.forEach(user => {

    checkPremiumExpiration(user);

  });


  users =
    getUsers();


  const premiumCount =
    users.filter(
      user => user.premium === true
    ).length;


  const expiredCount =
    users.filter(
      user =>
        !user.premium &&
        user.premiumExpiredAt
    ).length;


  const totalMembers =
    document.getElementById(
      "totalMembers"
    );

  const premiumMembers =
    document.getElementById(
      "premiumMembers"
    );

  const expiredMembers =
    document.getElementById(
      "expiredMembers"
    );

  const totalPayments =
    document.getElementById(
      "totalPayments"
    );


  if (totalMembers) {

    totalMembers.textContent =
      users.length;

  }


  if (premiumMembers) {

    premiumMembers.textContent =
      premiumCount;

  }


  if (expiredMembers) {

    expiredMembers.textContent =
      expiredCount;

  }


  if (totalPayments) {

    totalPayments.textContent =
      payments.length;

  }


  renderAdminMembers();

  renderAdminPayments();
}


/* =========================================================
   LISTE DES MEMBRES
========================================================= */

function renderAdminMembers() {

  const container =
    document.getElementById(
      "adminMembers"
    );

  if (!container) return;


  const searchInput =
    document.getElementById(
      "memberSearch"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const users =
    getUsers().filter(user => {

      const name =
        String(user.name || "")
          .toLowerCase();

      const email =
        String(user.email || "")
          .toLowerCase();

      const whatsapp =
        String(user.whatsapp || "")
          .toLowerCase();


      return (
        name.includes(search) ||
        email.includes(search) ||
        whatsapp.includes(search)
      );

    });


  if (!users.length) {

    container.innerHTML = `
      <p style="color:#9eafc3">
        Aucun membre trouvé.
      </p>
    `;

    return;
  }


  container.innerHTML =
    users.map(user => {

      const active =
        user.premium === true &&
        user.premiumExpiresAt &&
        new Date(
          user.premiumExpiresAt
        ) > new Date();


      return `

        <div class="member-item">

          <div class="member-info">

            <h4>
              ${escapeHTML(user.name)}
            </h4>

            <p>
              📧
              ${escapeHTML(user.email)}
            </p>

            <p>
              📱
              ${escapeHTML(user.whatsapp)}
            </p>

            <p>

              Statut :

              <strong
                style="color:${
                  active
                    ? "#f5c542"
                    : "#ff4d67"
                }">

                ${
                  active
                    ? "PREMIUM"
                    : "GRATUIT"
                }

              </strong>

            </p>

            <p>

              Expiration :

              ${formatDate(
                user.premiumExpiresAt
              )}

            </p>

          </div>


          <div class="member-actions">

            <button
              class="small-btn open-btn"
              onclick="openAdminModal('${user.id}')">

              💎 Gérer Premium

            </button>

          </div>

        </div>

      `;

    }).join("");
}


/* =========================================================
   OUVRIR LA FENÊTRE ADMIN
========================================================= */

function openAdminModal(userId) {

  if (!isAdminLogged()) {

    showSection("adminLogin");

    return;
  }


  const users =
    getUsers();


  const user =
    users.find(
      u => u.id === userId
    );


  if (!user) {

    alert(
      "Membre introuvable."
    );

    return;
  }


  const memberIdInput =
    document.getElementById(
      "paymentMemberId"
    );


  if (memberIdInput) {

    memberIdInput.value =
      user.id;

  }


  const info =
    document.getElementById(
      "selectedMemberInfo"
    );


  if (info) {

    info.innerHTML = `

      <div class="dashboard-card">

        <h3>
          ${escapeHTML(user.name)}
        </h3>

        <p>
          📧
          ${escapeHTML(user.email)}
        </p>

        <p>
          📱
          ${escapeHTML(user.whatsapp)}
        </p>

        <p>
          Statut :

          <strong
            style="color:${
              user.premium
                ? "#f5c542"
                : "#ff4d67"
            }">

            ${
              user.premium
                ? "PREMIUM"
                : "GRATUIT"
            }

          </strong>
        </p>

        <p>
          Expiration :
          ${formatDate(
            user.premiumExpiresAt
          )}
        </p>

      </div>

    `;

  }


  const actionMessage =
    document.getElementById(
      "adminActionMessage"
    );


  if (actionMessage) {

    actionMessage.innerHTML = "";

  }


  const modal =
    document.getElementById(
      "adminModal"
    );


  if (modal) {

    modal.classList.add("show");

  }
}


/* =========================================================
   FERMER LA FENÊTRE ADMIN
========================================================= */

function closeAdminModal() {

  const modal =
    document.getElementById(
      "adminModal"
    );

  if (modal) {

    modal.classList.remove(
      "show"
    );

  }
}


/* =========================================================
   DURÉE PERSONNALISÉE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const duration =
      document.getElementById(
        "premiumDuration"
      );


    if (duration) {

      duration.addEventListener(
        "change",
        () => {

          const custom =
            document.getElementById(
              "customDays"
            );


          if (!custom) return;


          if (
            duration.value === "custom"
          ) {

            custom.style.display =
              "block";

          } else {

            custom.style.display =
              "none";

          }

        }
      );

    }


    renderPredictions();

  }
);
/* =========================================================
   ENREGISTRER UN PAIEMENT MOBILE MONEY
========================================================= */

function savePayment(event) {

  event.preventDefault();

  if (!isAdminLogged()) return;

  const memberId =
    document.getElementById("paymentMemberId").value;

  const amount =
    Number(document.getElementById("paymentAmount").value);

  const method =
    document.getElementById("paymentMethod").value;

  const reference =
    document.getElementById("paymentReference").value.trim();

  const note =
    document.getElementById("paymentNote").value.trim();

  if (!amount || amount <= 0) {
    showAdminMessage(
      "Veuillez saisir un montant valide.",
      "error-message"
    );
    return;
  }

  const users = getUsers();

  const user = users.find(u => u.id === memberId);

  if (!user) {
    showAdminMessage(
      "Membre introuvable.",
      "error-message"
    );
    return;
  }

  const payments = getPayments();

  const payment = {

    id: generateId("payment"),

    memberId: memberId,

    memberName: user.name,

    memberEmail: user.email,

    memberWhatsapp: user.whatsapp,

    amount: amount,

    method: method,

    reference: reference,

    note: note,

    date: new Date().toISOString(),

    verified: true

  };

  payments.push(payment);

  savePayments(payments);

  document.getElementById("paymentAmount").value = "";

  document.getElementById("paymentReference").value = "";

  document.getElementById("paymentNote").value = "";

  showAdminMessage(
    "✅ Paiement enregistré avec succès.",
    "success-message"
  );

  renderAdminDashboard();
}


/* =========================================================
   ACTIVER / PROLONGER PREMIUM
========================================================= */

function activatePremium() {

  if (!isAdminLogged()) return;

  const memberId =
    document.getElementById("paymentMemberId").value;

  const users = getUsers();

  const index =
    users.findIndex(u => u.id === memberId);

  if (index === -1) {

    showAdminMessage(
      "Membre introuvable.",
      "error-message"
    );

    return;
  }

  const user = users[index];

  const duration =
    document.getElementById("premiumDuration").value;

  let days;

  if (duration === "custom") {

    days =
      Number(
        document.getElementById("customDays").value
      );

    if (!days || days < 1) {

      showAdminMessage(
        "Veuillez saisir une durée valide.",
        "error-message"
      );

      return;
    }

  } else {

    days = Number(duration);

  }

  const now = new Date();

  /*
    On vérifie AVANT modification si le Premium
    était encore actif.
  */

  const wasActive =
    user.premium &&
    user.premiumExpiresAt &&
    new Date(user.premiumExpiresAt) > now;

  let startDate = now;

  /*
    Si le membre possède encore du Premium,
    on ajoute les nouveaux jours à son ancienne
    date d'expiration.
  */

  if (wasActive) {

    startDate =
      new Date(user.premiumExpiresAt);

  }

  const expiration =
    new Date(startDate);

  expiration.setDate(
    expiration.getDate() + days
  );

  user.premium = true;

  user.premiumExpiresAt =
    expiration.toISOString();

  if (!user.subscriptionHistory) {

    user.subscriptionHistory = [];

  }

  user.subscriptionHistory.push({

    id: generateId("subscription"),

    action:
      wasActive
        ? "Premium prolongé"
        : "Premium activé",

    days: days,

    date: now.toISOString(),

    expiresAt:
      user.premiumExpiresAt

  });

  users[index] = user;

  saveUsers(users);

  showAdminMessage(

    "✅ Premium " +
    (wasActive ? "prolongé" : "activé") +
    " jusqu'au " +
    formatDate(user.premiumExpiresAt),

    "success-message"

  );

  renderAdminDashboard();

  setTimeout(() => {

    openAdminModal(user.id);

  }, 100);
}


/* =========================================================
   DÉSACTIVER PREMIUM
========================================================= */

function disablePremium() {

  if (!isAdminLogged()) return;

  const memberId =
    document.getElementById("paymentMemberId").value;

  const users = getUsers();

  const index =
    users.findIndex(u => u.id === memberId);

  if (index === -1) {

    showAdminMessage(
      "Membre introuvable.",
      "error-message"
    );

    return;
  }

  const now =
    new Date().toISOString();

  users[index].premium = false;

  users[index].premiumExpiresAt = null;

  users[index].premiumDisabledAt = now;

  if (!users[index].subscriptionHistory) {

    users[index].subscriptionHistory = [];

  }

  users[index].subscriptionHistory.push({

    id: generateId("subscription"),

    action: "Premium désactivé",

    days: 0,

    date: now,

    expiresAt: null

  });

  saveUsers(users);

  showAdminMessage(
    "✅ Premium désactivé.",
    "success-message"
  );

  renderAdminDashboard();

  setTimeout(() => {

    openAdminModal(memberId);

  }, 100);
}


/* =========================================================
   MESSAGE ADMIN
========================================================= */

function showAdminMessage(text, className) {

  const element =
    document.getElementById(
      "adminActionMessage"
    );

  if (!element) return;

  element.className = className;

  element.textContent = text;

}


/* =========================================================
   AFFICHAGE DES PAIEMENTS
========================================================= */

function renderAdminPayments() {

  const container =
    document.getElementById("adminPayments");

  if (!container) return;

  const payments =
    getPayments()
      .slice()
      .reverse();

  if (!payments.length) {

    container.innerHTML = `
      <p style="color:#9eafc3">
        Aucun paiement enregistré.
      </p>
    `;

    return;
  }

  container.innerHTML =

    payments.map(payment => {

      return `

        <div class="payment-item">

          <strong>
            ${escapeHTML(payment.memberName)}
          </strong>

          <p>
            📱 ${escapeHTML(payment.memberWhatsapp)}
          </p>

          <p>
            💰
            ${Number(payment.amount)
              .toLocaleString("fr-FR")}
            FCFA
          </p>

          <p>
            💳 ${escapeHTML(payment.method)}
          </p>

          <p>
            Référence :
            ${escapeHTML(
              payment.reference || "Non fournie"
            )}
          </p>

          <p>
            Date :
            ${formatDateTime(payment.date)}
          </p>

          ${
            payment.note
              ? `
                <p>
                  📝 ${escapeHTML(payment.note)}
                </p>
              `
              : ""
          }

          <p style="color:#00d084">
            ✅ Paiement vérifié manuellement
          </p>

        </div>

      `;

    }).join("");

}


/* =========================================================
   INITIALISATION FINALE
========================================================= */

(function init() {

  const user =
    getCurrentUser();

  if (user) {

    checkPremiumExpiration(user);

  }

})();
