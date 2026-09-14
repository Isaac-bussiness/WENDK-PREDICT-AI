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
