"use strict";

const WHATSAPP_NUMBER = "22607309472";

const matches = [
  {id:1, league:"La Liga", home:"Real Madrid", away:"Barcelona", homeCode:"RM", awayCode:"FCB", time:"20:00", type:"premium", indication:"Plus de 1,5 buts"},
  {id:2, league:"Premier League", home:"Arsenal", away:"Chelsea", homeCode:"ARS", awayCode:"CHE", time:"18:30", type:"football", indication:"Double chance"},
  {id:3, league:"Serie A", home:"Inter", away:"Milan", homeCode:"INT", awayCode:"MIL", time:"19:45", type:"premium", indication:"Analyse Premium"},
  {id:4, league:"Ligue 1", home:"PSG", away:"Lyon", homeCode:"PSG", awayCode:"OL", time:"21:00", type:"football", indication:"Buts dans le match"},
  {id:5, league:"Bundesliga", home:"Bayern", away:"Dortmund", homeCode:"FCB", awayCode:"BVB", time:"17:30", type:"premium", indication:"Analyse Premium"},
  {id:6, league:"Liga Portugal", home:"Porto", away:"Benfica", homeCode:"FCP", awayCode:"SLB", time:"20:30", type:"football", indication:"Les deux équipes marquent"}
];

const grid = document.getElementById("matchGrid");

function renderMatches(filter="all"){
  const list = filter === "all" ? matches : matches.filter(m => m.type === filter);
  grid.innerHTML = list.map(m => `
    <article class="match-card">
      <div class="match-top"><span class="league">${m.league}</span><span>${m.time}</span></div>
      <div class="match-teams">
        <div><div class="team-icon">${m.homeCode}</div><div class="team-name">${m.home}</div></div>
        <div class="score-time">VS</div>
        <div><div class="team-icon">${m.awayCode}</div><div class="team-name">${m.away}</div></div>
      </div>
      <div class="indication">
        ${m.type === "premium" ? `<span class="locked">🔒 Indication masquée</span><span class="premium-tag">PREMIUM</span>` : `<span>💡 ${m.indication}</span><span class="premium-tag">ANALYSE</span>`}
      </div>
    </article>
  `).join("");
}

renderMatches();

document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    renderMatches(btn.dataset.filter);
  });
});

document.querySelectorAll("[data-scroll]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const target=document.querySelector(btn.dataset.scroll);
    if(target) target.scrollIntoView({behavior:"smooth"});
  });
});

const modal=document.getElementById("paymentModal");
const selectedPlan=document.getElementById("selectedPlan");

document.querySelectorAll("[data-plan]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedPlan.textContent=btn.dataset.plan;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
  });
});

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}
document.getElementById("closeModal").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal) closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape") closeModal();});

document.getElementById("contactPayment").addEventListener("click",()=>{
  const message = encodeURIComponent(
    "Bonjour WENDK PREDICT PRO. Je souhaite activer l'offre : " + selectedPlan.textContent
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,"_blank");
});
