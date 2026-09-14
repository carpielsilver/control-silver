// ─── RENDER ────────────────────────────────────────────
function render(){
  renderNav();
  const c=document.getElementById('content');
  const map={dashboard:renderDashboard,inventario:renderInventario,reservas:renderReservas,
    calendario:renderCalendario,finanzas:renderFinanzas,carpinteria:renderCarpinteria,contrato:renderContratoTab};
  c.innerHTML=(map[state.tab]||renderDashboard)();
  bindEvents();
}
function renderNav(){
  const TABS=[['dashboard','Inicio'],['inventario','Inventario'],['reservas','Cotizar'],['calendario','Calendario'],['finanzas','Finanzas'],['carpinteria','Taller'],['contrato','Contratos']];
  const t=document.getElementById('bottomnav');
  t.innerHTML=TABS.map(([k,l])=>`<button class="navitem ${state.tab===k?'active':''}" data-tab="${k}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg><span>${l}</span></button>`).join('');
  t.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;window.scrollTo(0,0);render();});
}

