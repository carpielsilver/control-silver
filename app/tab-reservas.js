// ─── RESERVAS + COTIZACIONES ────────────────────────────
// ─── CLIENTES FRECUENTES ────────────────────────────────
function getFrequentClients(){
  const map={};
  for(const b of state.bookings){
    const key=(b.telefono||b.client).trim().toLowerCase();
    if(!key)continue;
    if(!map[key])map[key]={client:b.client,telefono:b.telefono,count:0,saldo:0};
    map[key].count++;
    if(b.status==='confirmed'){
      const s=restanteDe(b);
      if(s>0)map[key].saldo+=s;
    }
  }
  return Object.values(map).sort((a,b)=>b.count-a.count);
}

function renderReservas(){
  const editBk=state.editingBookingId?state.bookings.find(x=>x.id===state.editingBookingId):null;
  const yaAbonado=!!(editBk&&editBk.abonos&&editBk.abonos.length);
  const bd=letterBD(state.bkTexto);
  const km=parseFloat(state.bkKm)||0;
  const res=calcQ(bd.total,state.bkCorona,km);
  const incVal=state.bkIncomeOverride!==null?state.bkIncomeOverride:(res?res.total:'');
  const lRows=Object.entries(bd.counts).map(([ch,qty])=>{
    const item=state.inventory.find(i=>i.id===ch);
    return`<span class="pill ${item?'pill-neutral':'pill-bad'}" style="margin:0 4px 4px 0">${ch}×${qty}</span>`;
  }).join('');
  const geoMsg=state.bkGeoStatus==='ok'
    ?`<div class="msg msg-info">📌 <b>${esc(state.bkLugar)}</b> · ~${km} km ${km<=5?'· envío gratis':'· flete '+fmtM(km*15)}</div>`
    :state.bkGeoStatus==='error'?`<div class="msg msg-err">No reconocemos esa zona. Ajusta los km manualmente.</div>`:'';
  const accesorios=state.inventory.filter(i=>!i.isLetter);
  const accHtml=accesorios.map(it=>{
    const sel=state.bookingItemSel[it.id]||{checked:false,qty:1};
    return`<div class="itemcheck"><input type="checkbox" data-bi-check="${it.id}" ${sel.checked?'checked':''}><div class="name">${esc(it.name)} <span class="mono" style="color:var(--text-3)">(${it.total})</span></div><input type="number" min="1" max="${it.total}" data-bi-qty="${it.id}" value="${sel.qty}"></div>`;
  }).join('');
  const q=(state.bkFiltro||'').trim().toLowerCase();
  const sorted=[...state.bookings]
    .filter(b=>!q||String(b.client||'').toLowerCase().includes(q)||String(b.telefono||'').includes(q))
    .sort((a,b)=>b.dateStart.localeCompare(a.dateStart));
  const bkItems=sorted.map(b=>{
    const saldo=restanteDe(b);
    const dateLabel=b.dateStart===b.dateEnd?b.dateStart:`${b.dateStart}→${b.dateEnd}`;
    const names=b.items.map(i=>{const inv=state.inventory.find(x=>x.id===i.itemId);return`${inv?esc(inv.name):'?'}×${i.qty}`;}).join(' ');
    return`<div class="item">
      <div class="item-top">
        <div><div class="item-name">${esc(b.client)}</div><div class="item-meta">${dateLabel} · ${names}</div></div>
        <span class="item-val">${fmtM(b.income)}</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <span class="pill ${b.status==='confirmed'?'pill-ok':'pill-bad'}">${b.status==='confirmed'?'Confirmada':'Cancelada'}</span>
        ${saldo<=0?`<span class="pill pill-ok">Pagado ✓</span>`:`<span class="pill pill-warn">${fmtM(saldo)} pendiente</span>`}
      </div>
      <div class="item-actions">
        <a class="btn btn-contract btn-sm" href="${buildContratoUrl(b)}" target="_blank">📄 Contrato</a>
        <a class="btn btn-gcal btn-sm" href="${buildGCalUrl(b)}" target="_blank">📅</a>
        <button class="btn btn-whats btn-sm" data-wa-rec="${b.id}">💬</button>
        <button class="btn btn-ghost btn-sm" data-editbooking="${b.id}">✏️ Editar</button>
        ${b.status==='confirmed'?`<button class="btn btn-danger btn-sm" data-cancel="${b.id}">Cancelar</button>`:''}
        <button class="btn btn-danger btn-sm" data-delbooking="${b.id}">🗑️ Eliminar</button>
      </div>
      ${abonoWidget(b)}
      ${abonosListWidget(b)}
    </div>`;
  }).join('');

  const cotItems=state.cotizaciones.filter(c=>c.status!=='confirmada').map(c=>`
    <div class="item" style="${c.status==='rechazada'?'opacity:.5':''}">
      <div class="item-top">
        <div><div class="item-name">${esc(c.client)}</div><div class="item-meta">${esc(c.texto)} · ${c.fecha}</div></div>
        <span class="pill ${c.status==='rechazada'?'pill-bad':'pill-warn'}">${c.status==='rechazada'?'Rechazada':'Pendiente'}</span>
      </div>
      <div class="item-meta" style="margin-top:6px">${fmtM(c.quote)} · ${c.direccion||'sin dirección'}</div>
      <div class="item-actions">
        ${c.status==='pendiente'?`<button class="btn btn-primary btn-sm" data-cot-conv="${c.id}">✅ Convertir</button><button class="btn btn-danger btn-sm" data-cot-rej="${c.id}">Rechazar</button>`:''}
        <button class="btn btn-danger btn-sm" data-cot-del="${c.id}">Eliminar</button>
      </div>
    </div>`).join('');

  const freqClients=getFrequentClients();
  return`
  <div class="card">
    <div class="card-title">${state.editingBookingId?'✏️ Editando reserva':'Cotizador'}</div>
    ${state.editingBookingId?`<div class="msg msg-info">Estás editando una reserva existente. Cambia lo que necesites (letras, fechas, abono, etc.) y guarda.</div>`:''}
    ${state.bookingMsg?`<div class="msg ${state.bookingMsg.type==='ok'?'msg-ok':state.bookingMsg.type==='info'?'msg-info':'msg-err'}">${state.bookingMsg.text}</div>`:''}
    ${freqClients.length?`<label>Cliente frecuente</label>
    <select id="bkFreqClient">
      <option value="">+ Cliente nuevo</option>
      ${freqClients.map(c=>`<option value="${esc((c.telefono||c.client))}">${esc(c.client)}${c.telefono?' · '+esc(c.telefono):''}${c.saldo>0?' · debe '+fmtM(c.saldo):''}</option>`).join('')}
    </select>`:''}
    <label>Cliente</label>
    <input type="text" id="bkClient" value="${esc(state.bkClient)}" placeholder="Nombre">
    <label>Teléfono</label>
    <input type="text" id="bkTelefono" value="${esc(state.bkTelefono)}" placeholder="55 1234 5678">
    <label>Texto de las letras</label>
    <input type="text" id="bkTexto" value="${esc(state.bkTexto)}" placeholder="Ej. AMOR, FELIZ 15">
    ${bd.total>0?`<div style="margin-bottom:12px">${lRows}</div>`:''}
    <div class="chk-row">
      <input type="checkbox" id="bkCorona" ${state.bkCorona?'checked':''}>
      <label for="bkCorona">Incluye corona 👑</label>
    </div>
    <label>Dirección</label>
    <input type="text" id="bkDireccion" value="${esc(state.bkDireccion)}" placeholder="Municipio o alcaldía">
    <label>Km (auto/manual)</label>
    <input type="number" id="bkKm" min="0" value="${esc(state.bkKm)}">
    ${geoMsg}
    <div class="row">
      <div><label>Fecha inicio</label><input type="date" id="bkStart" value="${state.bkStart||todayISO()}"></div>
      <div><label>Fecha fin</label><input type="date" id="bkEnd" value="${state.bkEnd||state.bkStart||todayISO()}"></div>
    </div>
    <div class="row">
      <div><label>Hora entrega</label><input type="time" id="bkHoraEntrega" value="${esc(state.bkHoraEntrega)}"></div>
      <div><label>Hora recolección</label><input type="time" id="bkHoraRecoleccion" value="${esc(state.bkHoraRecoleccion)}"></div>
    </div>
    ${res?`<div class="quote-box">
      <div class="q-row"><span class="l">${bd.total} piezas × ${fmtM(res.ppu)}</span><span>${fmtM(res.letrasTotal)}</span></div>
      ${state.bkCorona?`<div class="q-row"><span class="l">👑 Corona</span><span style="color:${res.coronaGratis?'#9dc491':'inherit'}">${res.coronaGratis?'¡Gratis!':fmtM(res.coronaCosto)}</span></div>`:''}
      <div class="q-row"><span class="l">🚗 Flete (${km} km)</span><span style="color:${res.fleteCosto===0?'#9dc491':'inherit'}">${res.fleteCosto===0?'Gratis':fmtM(res.fleteCosto)}</span></div>
      <div class="q-total"><span class="ql">TOTAL</span><span class="qv">${fmtM(res.total)}</span></div>
    </div>`:'<div class="empty" style="padding:14px 0">Escribe el texto para ver el precio.</div>'}
    <label>Monto a cobrar</label>
    <input type="number" id="bkIncome" min="0" value="${incVal}">
    ${yaAbonado?`<div class="msg msg-info">Ya se registraron abonos por ${fmtM(totalAbonado(editBk))}. Usa el botón Abonar en la lista de reservas para agregar más — este campo ya no se usa.</div>`:`
    <label>Anticipo</label>
    <input type="number" id="bkAnticipo" min="0" value="${esc(state.bkAnticipo)}">
    <label>Método de pago</label>
    <select id="bkMetodo">
      <option value="" ${state.bkMetodo===''?'selected':''}>Sin especificar</option>
      <option value="Efectivo" ${state.bkMetodo==='Efectivo'?'selected':''}>Efectivo</option>
      <option value="Transferencia" ${state.bkMetodo==='Transferencia'?'selected':''}>Transferencia</option>
      <option value="Tarjeta" ${state.bkMetodo==='Tarjeta'?'selected':''}>Tarjeta</option>
    </select>`}
    <label>Notas</label>
    <textarea id="bkNotes" rows="2" placeholder="Instrucciones especiales...">${esc(state.bkNotes)}</textarea>
    ${accesorios.length?`<div class="section-label" style="margin-top:0">Piezas adicionales</div>${accHtml}`:''}
    <div class="action-row">
      ${state.editingBookingId?'':`<button class="btn btn-whats btn-block" id="whatsBtn" ${res?'':'disabled'}>💬 Enviar cotización por WhatsApp</button>
      <button class="btn btn-ghost btn-block" id="saveCotBtn" ${res?'':'disabled'}>💾 Guardar cotización</button>`}
      <button class="btn btn-primary btn-block" id="checkBookBtn">${state.editingBookingId?'💾 Guardar cambios':'✅ Verificar y reservar'}</button>
      ${state.editingBookingId?`<button class="btn btn-ghost btn-block" id="cancelEditBtn">Cancelar edición</button>`:''}
    </div>
  </div>
  ${state.cotizaciones.some(c=>c.status!=='confirmada')?`
  <div class="section-label">Cotizaciones pendientes</div>
  <div class="list">${cotItems}</div>`:''}
  <div class="section-label">Reservas · ${sorted.length}</div>
  <input type="text" id="bkFiltroInput" placeholder="🔍 Buscar por nombre o teléfono" value="${esc(state.bkFiltro)}" style="margin-bottom:10px">
  <div class="list">${sorted.length?bkItems:`<div class="empty">${q?'Sin resultados para esa búsqueda.':'Sin reservas aún.'}</div>`}</div>`;
}

