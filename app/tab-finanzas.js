// ─── FINANZAS ──────────────────────────────────────────
function periodKey(dt,g){return g==='mes'?dt.slice(0,7):dt.slice(0,4);}
function computeSummary(g){
  const map={};
  for(const b of state.bookings){if(b.status!=='confirmed')continue;const k=periodKey(b.dateStart,g);map[k]=map[k]||{income:0,expense:0};map[k].income+=Number(b.income)||0;}
  for(const e of state.expenses){const k=periodKey(e.date,g);map[k]=map[k]||{income:0,expense:0};map[k].expense+=Number(e.amount)||0;}
  return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,v])=>({period:k,...v,profit:v.income-v.expense}));
}
function renderFinanzas(){
  const g=state.finGroupBy;
  const summary=computeSummary(g);
  const ti=summary.reduce((s,r)=>s+r.income,0),te=summary.reduce((s,r)=>s+r.expense,0);
  const catTotals={};for(const e of state.expenses)catTotals[e.category]=(catTotals[e.category]||0)+(Number(e.amount)||0);
  const maxC=Math.max(1,...Object.values(catTotals));
  const catBars=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`
    <div class="catbar"><div class="catname">${esc(cat)}</div><div class="track"><div class="fill" style="width:${(amt/maxC*100).toFixed(0)}%"></div></div><div class="amt">${fmtM(amt)}</div></div>`).join('')||'<div class="empty">Sin gastos.</div>';
  const sItems=summary.map(r=>`<div class="item">
    <div class="item-top"><div><div class="item-name">${r.period}</div><div class="item-meta">Ingresos ${fmtM(r.income)} · Gastos ${fmtM(r.expense)}</div></div>
    <span class="item-val" style="color:${r.profit>=0?'#9dc491':'#ef8b6f'}">${fmtM(r.profit)}</span></div>
  </div>`).join('');
  const eItems=[...state.expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15).map(e=>`<div class="item">
    <div class="item-top"><div><div class="item-name">${esc(e.category)}</div><div class="item-meta">${e.date}${e.description?' · '+esc(e.description):''}</div></div><span class="item-val">${fmtM(e.amount)}</span></div>
    <div class="item-actions"><button class="btn btn-danger btn-sm" data-delexp="${e.id}">Eliminar</button></div>
  </div>`).join('');
  const cats=allCats();
  return`
  <div class="card">
    <div class="card-title">Resumen general</div>
    <div class="stat-grid">
      <div class="stat income"><div class="lbl">Ingresos</div><div class="val">${fmtM(ti)}</div></div>
      <div class="stat expense"><div class="lbl">Gastos</div><div class="val">${fmtM(te)}</div></div>
    </div>
    <div class="stat profit" style="margin-bottom:14px"><div class="lbl">Utilidad</div><div class="val">${fmtM(ti-te)}</div></div>
    <div class="toggle-grp">
      <button data-group="mes" class="${g==='mes'?'active':''}">Por mes</button>
      <button data-group="año" class="${g==='año'?'active':''}">Por año</button>
    </div>
    <button class="btn btn-ghost btn-block" id="pdfBtn" style="margin-bottom:14px">📄 Descargar reporte PDF</button>
    <button class="btn btn-ghost btn-block" id="backupBtn" style="margin-bottom:14px">⬇️ Descargar respaldo completo (.json)</button>
    ${summary.length?`<div class="list">${sItems}</div>`:'<div class="empty">Sin datos.</div>'}
  </div>
  <div class="card"><div class="card-title">Gastos por categoría</div>${catBars}</div>
  <div class="card">
    <div class="card-title">Registrar gasto</div>
    <label>Fecha</label><input type="date" id="expDate" value="${todayISO()}">
    <label>Categoría</label><select id="expCat">${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
    <label>Monto</label><input type="number" id="expAmt" min="0" placeholder="500">
    <label>Descripción</label><input type="text" id="expDesc" placeholder="Descripción">
    <button class="btn btn-primary btn-block" id="addExpBtn">Agregar gasto</button>
  </div>
  <div class="card">
    <div class="card-title">Categorías personalizadas</div>
    <div class="cat-add"><input type="text" id="newCatName" placeholder="Ej. Transporte" style="margin-bottom:0"><button class="btn btn-ghost" id="addCatBtn">+ Agregar</button></div>
    ${state.expCategories.length?`<div class="cat-tags">${state.expCategories.map(c=>`<span class="cat-tag">${esc(c)}<button data-delcat="${esc(c)}">×</button></span>`).join('')}</div>`:''}
  </div>
  <div class="section-label">Últimos gastos</div>
  <div class="list">${state.expenses.length?eItems:'<div class="empty">Sin gastos.</div>'}</div>`;
}

