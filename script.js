"use strict";

const STORAGE_USERS = "wendkPredictUsersV2";
const STORAGE_CURRENT = "wendkPredictCurrentV2";

const matches = [
  {league:"La Liga",home:"Real Madrid",away:"Barcelona",hc:"RM",ac:"FCB",time:"20:00",type:"premium",ind:"Plus de 1,5 buts"},
  {league:"Premier League",home:"Arsenal",away:"Chelsea",hc:"ARS",ac:"CHE",time:"18:30",type:"free",ind:"Double chance"},
  {league:"Serie A",home:"Inter",away:"Milan",hc:"INT",ac:"MIL",time:"19:45",type:"premium",ind:"Analyse Premium"},
  {league:"Ligue 1",home:"PSG",away:"Lyon",hc:"PSG",ac:"OL",time:"21:00",type:"free",ind:"Buts dans le match"},
  {league:"Bundesliga",home:"Bayern",away:"Dortmund",hc:"FCB",ac:"BVB",time:"17:30",type:"premium",ind:"Analyse Premium"},
  {league:"Liga Portugal",home:"Porto",away:"Benfica",hc:"FCP",ac:"SLB",time:"20:30",type:"free",ind:"Les deux équipes marquent"}
];

let authMode = "login";
let selectedOffer = null;

const $ = id => document.getElementById(id);
const getUsers = () => JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
const saveUsers = users => localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
const getCurrent = () => localStorage.getItem(STORAGE_CURRENT);

function currentUser(){
  const contact = getCurrent();
  if(!contact) return null;
  const users = getUsers();
  const u = users.find(x => x.contact === contact);
  if(!u) { localStorage.removeItem(STORAGE_CURRENT); return null; }
  return refreshPremium(u);
}
function refreshPremium(user){
  if(user.premiumUntil && new Date(user.premiumUntil).getTime() <= Date.now()){
    user.premiumUntil = null; user.plan = null;
    const users=getUsers().map(x=>x.contact===user.contact?user:x); saveUsers(users);
  }
  return user;
}
function showModal(id){$(id).classList.add("show");$(id).setAttribute("aria-hidden","false")}
function closeModal(id){$(id).classList.remove("show");$(id).setAttribute("aria-hidden","true")}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2800)}

function renderMatches(filter="all"){
  const user=currentUser();
  const premiumActive=!!(user && user.premiumUntil && new Date(user.premiumUntil)>new Date());
  const list=filter==="all"?matches:matches.filter(m=>m.type===filter);
  $("matchGrid").innerHTML=list.map(m=>{
    const unlocked=m.type==="free" || premiumActive;
    return `<article class="match-card">
      <div class="match-top"><span class="league">${m.league}</span><span>${m.time}</span></div>
      <div class="match-teams">
        <div><div class="team-icon">${m.hc}</div><div class="team-name">${m.home}</div></div>
        <div class="score-time">VS</div>
        <div><div class="team-icon">${m.ac}</div><div class="team-name">${m.away}</div></div>
      </div>
      <div class="indication">
        ${unlocked ? `<span>💡 ${m.ind}</span>` : `<span class="locked">🔒 Indication masquée</span>`}
        ${m.type==="premium"?`<span class="premium-tag">${unlocked?"DÉBLOQUÉ":"PREMIUM"}</span>`:`<span class="premium-tag">ANALYSE</span>`}
      </div>
    </article>`;
  }).join("");
}

function renderDashboard(){
  const u=currentUser();
  $("loggedOutPanel").classList.toggle("hidden",!!u);
  $("memberPanel").classList.toggle("hidden",!u);
  if(!u) return;
  const active=!!u.premiumUntil;
  $("memberAvatar").textContent=(u.name||"W").trim().charAt(0).toUpperCase();
  $("memberName").textContent=u.name||"Membre";
  $("memberContact").textContent=u.contact;
  $("memberStatus").textContent=active?"PREMIUM":"GRATUIT";
  $("memberStatus").style.color=active?"#36d98a":"#f3bd4b";
  $("memberPlan").textContent=u.plan||"Aucune";
  $("memberExpiry").textContent=active?formatDate(u.premiumUntil):"—";
  $("accessTitle").textContent=active?"Accès Premium actif":"Compte gratuit";
  $("accessText").textContent=active?"Tes indications Premium sont déverrouillées jusqu'à la date indiquée.":"Choisis une formule Premium pour débloquer les analyses réservées.";
  $("upgradeBtn").textContent=active?"Prolonger mon Premium":"Passer Premium";
  const h=(u.history||[]).slice().reverse();
  $("history").innerHTML=h.length?h.map(x=>`<div class="history-item"><b>${x.plan} — ${Number(x.price).toLocaleString("fr-FR")} FCFA</b><span>${x.status} • ${formatDate(x.date)}</span></div>`).join(""):"<p>Aucun abonnement enregistré.</p>";
}

function formatDate(value){return new Date(value).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})}

function setAuthMode(mode){
  authMode=mode;
  document.querySelectorAll(".auth-tab").forEach(b=>b.classList.toggle("active",b.dataset.auth===mode));
  $("nameField").classList.toggle("hidden",mode!=="signup");
  $("nameInput").required=mode==="signup";
  $("authSubmit").textContent=mode==="signup"?"Créer mon compte":"Se connecter";
  $("authMessage").textContent="";
}

function openAuth(mode="login"){setAuthMode(mode);showModal("authModal")}

$("loginBtn").onclick=()=>openAuth("login");
$("signupBtn").onclick=()=>openAuth("signup");
$("heroSignup").onclick=()=>openAuth("signup");
$("dashboardLogin").onclick=()=>openAuth("login");
document.querySelectorAll(".auth-tab").forEach(b=>b.onclick=()=>setAuthMode(b.dataset.auth));
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
document.querySelectorAll("[data-scroll]").forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll)?.scrollIntoView({behavior:"smooth"}));

$("authForm").addEventListener("submit",e=>{
  e.preventDefault();
  const contact=$("contactInput").value.trim().toLowerCase();
  const password=$("passwordInput").value;
  const users=getUsers();
  if(authMode==="signup"){
    if(users.some(u=>u.contact===contact)){ $("authMessage").textContent="Ce contact possède déjà un compte."; return; }
    if(password.length<6){$("authMessage").textContent="Le mot de passe doit contenir au moins 6 caractères.";return;}
    const user={name:$("nameInput").value.trim(),contact,password,premiumUntil:null,plan:null,history:[]};
    users.push(user);saveUsers(users);localStorage.setItem(STORAGE_CURRENT,contact);
    closeModal("authModal");$("authForm").reset();renderDashboard();renderMatches();document.querySelector("#dashboard").scrollIntoView({behavior:"smooth"});toast("Compte créé avec succès.");
  }else{
    const user=users.find(u=>u.contact===contact && u.password===password);
    if(!user){$("authMessage").textContent="Contact ou mot de passe incorrect.";return;}
    refreshPremium(user);localStorage.setItem(STORAGE_CURRENT,contact);closeModal("authModal");$("authForm").reset();renderDashboard();renderMatches();toast("Connexion réussie.");
  }
});

$("logoutBtn").onclick=()=>{localStorage.removeItem(STORAGE_CURRENT);renderDashboard();renderMatches();toast("Déconnexion effectuée.");};

document.querySelectorAll(".planBtn").forEach(btn=>btn.onclick=()=>{
  if(!currentUser()){toast("Crée d'abord ton compte membre.");openAuth("signup");return;}
  selectedOffer={plan:btn.dataset.plan,price:Number(btn.dataset.price),days:Number(btn.dataset.days)};
  $("selectedPlan").textContent=`${selectedOffer.plan} — ${selectedOffer.price.toLocaleString("fr-FR")} FCFA`;
  $("paymentText").textContent=`Tu as choisi ${selectedOffer.plan.toLowerCase()} pour ${selectedOffer.days} jour(s).`;
  showModal("paymentModal");
});

$("requestActivation").onclick=()=>{
  if(!selectedOffer)return;
  const u=currentUser();
  const msg=encodeURIComponent(`Bonjour WENDK PREDICT PRO. Je suis ${u.name||"membre"} (${u.contact}). Je souhaite souscrire à l'offre ${selectedOffer.plan} à ${selectedOffer.price} FCFA.`);
  window.open(`https://wa.me/22607309472?text=${msg}`,"_blank");
  toast("Demande envoyée sur WhatsApp. Le paiement réel sera connecté dans l'étape suivante.");
  closeModal("paymentModal");
};

/* Démo locale facultative :
   Pour tester l'expérience Premium sans paiement réel, ouvrir la console et exécuter :
   wendkDemoActivate(7)
   En production, cette fonction NE doit PAS exister : l'activation doit venir du backend après webhook de paiement. */
window.wendkDemoActivate=function(days=7){
  const u=currentUser(); if(!u){console.log("Connecte-toi d'abord.");return;}
  const until=new Date(Date.now()+days*86400000).toISOString();
  u.premiumUntil=until;u.plan=`Démo ${days} jour(s)`;u.history=u.history||[];
  u.history.push({plan:u.plan,price:0,status:"DÉMO",date:new Date().toISOString()});
  saveUsers(getUsers().map(x=>x.contact===u.contact?u:x));renderDashboard();renderMatches();toast("Premium de démonstration activé.");
};

document.querySelectorAll(".filter").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));btn.classList.add("active");renderMatches(btn.dataset.filter);
});

renderDashboard();
renderMatches();
setInterval(()=>{renderDashboard();renderMatches();},60000);
