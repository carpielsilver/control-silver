// ─── DASHBOARD ─────────────────────────────────────────
function renderDashboard(){
  const now=new Date();
  const diaNombre=now.toLocaleDateString('es-MX',{weekday:'long'});
  const fechaLarga=now.toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});
  const horaStr=now.toLocaleTimeString('es-MX',{hour:'numeric',minute:'2-digit'});
  const hr=now.getHours();
  const saludo=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches';
  const greetHtml=`<div class="greet-card">
    <div class="greet-top"><span class="greet-hola">${saludo} 👋</span><span class="greet-time" id="liveClock">${horaStr}</span></div>
    <div class="greet-date">${diaNombre.charAt(0).toUpperCase()+diaNombre.slice(1)}, ${fechaLarga}</div>
  </div>`;
  const today=todayISO();
  const semana=semanaActual();
  const rangoSemana=`${semana.inicio.slice(8,10)}/${semana.inicio.slice(5,7)} al ${semana.fin.slice(8,10)}/${semana.fin.slice(5,7)}`;

  const todosSemana=state.bookings.filter(b=>b.status==='confirmed'&&tocaSemana(b,semana));
  const eventosSemana=todosSemana.filter(b=>!estaLiquidado(b)).sort((a,b)=>a.dateStart.localeCompare(b.dateStart));
  const enProceso=state.projects.filter(p=>p.status==='En proceso');

  const semIncome=todosSemana.reduce((s,b)=>s+(Number(b.income)||0),0);
  const porCobrarSemana=eventosSemana.reduce((s,b)=>s+restanteDe(b),0);

  // El dinero que entra se cuenta por la fecha real del abono, no por la fecha del evento
  const abonosSemana=abonosEnRango(semana.inicio,semana.fin);
  const efectivoSemana=abonosSemana.filter(a=>a.metodo==='Efectivo').reduce((s,a)=>s+(Number(a.monto)||0),0);
  const tarjetaSemana=abonosSemana.filter(a=>a.metodo==='Tarjeta'||a.metodo==='Transferencia').reduce((s,a)=>s+(Number(a.monto)||0),0);
  const detalleMetodo=state.dashFiltroMetodo?abonosSemana.filter(a=>state.dashFiltroMetodo==='Efectivo'?a.metodo==='Efectivo':(a.metodo==='Tarjeta'||a.metodo==='Transferencia')):[];

  const proxHtml=eventosSemana.length?`<div class="list">`+eventosSemana.map(b=>{
    const days=Math.ceil((new Date(b.dateStart+'T00:00:00')-new Date(today+'T00:00:00'))/(86400000));
    const vencido=b.dateEnd<today;
    const label=vencido?'⚠️ Venció':days===0?'HOY':days===1?'MAÑANA':days<0?'en curso':`en ${days} días`;
    const pillClass=vencido?'pill-bad':days===0?'pill-bad':days===1?'pill-warn':'pill-ok';
    const total=Number(b.income)||0,rest=restanteDe(b);
    return`<div class="item">
      <div class="item-top">
        <div><div class="item-name">${esc(letrasDeReserva(b))} — ${esc(b.client)}</div><div class="item-meta">${b.dateStart} · ${esc(ubicacionCorta(b))}${b.horaEntrega?' · '+b.horaEntrega:''}<br>Debe ${fmtM(rest)} de ${fmtM(total)} total</div></div>
        <span class="pill ${pillClass}">${label}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-primary btn-sm" data-viewbooking="${b.id}">🔍 Ver detalles</button>
        <a class="btn btn-gcal btn-sm" href="${buildGCalUrl(b)}" target="_blank" rel="noopener">📅 Calendar</a>
        <button class="btn btn-whats btn-sm" data-wa-rec="${b.id}">💬 Recordar</button>
      </div>
      ${abonoWidget(b)}
    </div>`;
  }).join('')+`</div>`:`<div class="empty" style="color:#9dc491">✓ Sin saldos pendientes esta semana</div>`;

  const procHtml=enProceso.length?`<div class="list">`+enProceso.map(p=>`
    <div class="item">
      <div class="item-top">
        <div><div class="item-name">${esc(p.nombre)}</div><div class="item-meta">${esc(p.cliente)} · Entrega: ${p.fechaEntrega||'—'}</div></div>
        <span class="pill pill-warn">En proceso</span>
      </div>
    </div>`).join('')+`</div>`:`<div class="empty">Sin proyectos en proceso.</div>`;

  return`
  ${greetHtml}
  <div class="card">
    <div class="card-title">Eventos de esta semana</div>
    <div class="card-sub">${rangoSemana} · al abonar el resto, el evento se quita de esta lista</div>
    ${proxHtml}
  </div>
  <div class="stat-grid">
    <div class="stat income"><div class="lbl">Ingresos de la semana</div><div class="val">${fmtM(semIncome)}</div></div>
    <div class="stat warn"><div class="lbl">Por cobrar (semana)</div><div class="val">${fmtM(porCobrarSemana)}</div></div>
  </div>
  <div class="card">
    <div class="card-title">Dinero que entra — esta semana</div>
    <div class="card-sub">Toca efectivo o tarjeta para ver qué eventos lo pagaron así</div>
    <div class="stat-grid">
      <div class="stat income" data-metfiltro="Efectivo" style="cursor:pointer">
        <div class="lbl">💵 Efectivo${state.dashFiltroMetodo==='Efectivo'?' ▲':''}</div><div class="val">${fmtM(efectivoSemana)}</div>
      </div>
      <div class="stat income" data-metfiltro="Tarjeta" style="cursor:pointer">
        <div class="lbl">💳 Tarjeta${state.dashFiltroMetodo==='Tarjeta'?' ▲':''}</div><div class="val">${fmtM(tarjetaSemana)}</div>
      </div>
    </div>
    ${state.dashFiltroMetodo?`<div class="list" style="margin-top:10px">${detalleMetodo.length?detalleMetodo.map(a=>`<div class="item"><div class="item-top"><div><div class="item-name">${esc(a.client)}</div><div class="item-meta">${a.fecha}</div></div><span class="item-val">${fmtM(a.monto)}</span></div></div>`).join(''):'<div class="empty">Sin abonos por ese medio esta semana.</div>'}</div>`:''}
  </div>
  <div class="card">
    <div class="card-title">Carpintería en proceso</div>
    ${procHtml}
  </div>`;
}

