// ─── HISTORIAL / CONTRATOS ─────────────────────────────
function renderContratoTab(){
  const histMap={};
  for(const b of state.bookings){
    if(b.status!=='confirmed')continue;
    if(!histMap[b.client])histMap[b.client]={count:0,total:0,last:''};
    histMap[b.client].count++;
    histMap[b.client].total+=Number(b.income)||0;
    if(b.dateStart>histMap[b.client].last)histMap[b.client].last=b.dateStart;
  }
  const histItems=Object.entries(histMap).sort((a,b)=>b[1].total-a[1].total).map(([name,h])=>`
    <div class="item">
      <div class="item-top"><div><div class="item-name">${esc(name)}</div><div class="item-meta">Último: ${h.last} · ${h.count} evento${h.count>1?'s':''}</div></div><span class="item-val">${fmtM(h.total)}</span></div>
    </div>`).join('');
  const sorted=[...state.bookings].filter(b=>b.status==='confirmed').sort((a,b)=>b.dateStart.localeCompare(a.dateStart));
  const items=sorted.map(b=>`<div class="item">
    <div class="item-top"><div><div class="item-name">${esc(b.client)}</div><div class="item-meta">${b.dateStart}</div></div><span class="item-val">${fmtM(b.income)}</span></div>
    <div class="item-actions">
      <a class="btn btn-contract btn-sm" href="${buildContratoUrl(b)}" target="_blank">📄 Contrato</a>
      <a class="btn btn-gcal btn-sm" href="${buildGCalUrl(b)}" target="_blank">📅</a>
    </div>
  </div>`).join('');
  return`
  <div class="section-label">Historial de clientes</div>
  <div class="list">${Object.keys(histMap).length?histItems:'<div class="empty">Sin reservas confirmadas.</div>'}</div>
  <div class="section-label">Contratos por reserva</div>
  <div class="list">${sorted.length?items:'<div class="empty">Sin reservas.</div>'}</div>
  <div class="card">
    <div class="card-title">Contrato en blanco</div>
    <a class="btn btn-contract btn-block" href="contrato.html" target="_blank">📄 Abrir en blanco</a>
  </div>
  <div class="section-label">Inventario</div>
  <button class="btn btn-ghost btn-block" data-tab="inventario" onclick="state.tab='inventario';render();window.scrollTo(0,0);">📦 Ir a inventario</button>`;
}

