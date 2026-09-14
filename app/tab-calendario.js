// ─── CALENDARIO ────────────────────────────────────────
function renderCalendario(){
  const y=state.calYear,m=state.calMonth;
  const first=new Date(y,m,1);
  const startDow=first.getDay();
  const dim=new Date(y,m+1,0).getDate();
  const mName=first.toLocaleDateString('es-MX',{month:'long',year:'numeric'});
  const dows=['D','L','M','M','J','V','S'];
  let cells='';
  for(let i=0;i<startDow;i++)cells+=`<div class="day empty2"></div>`;
  for(let d=1;d<=dim;d++){
    const dt=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cov=state.bookings.filter(b=>bookingCoversDate(b,dt));
    const dots=cov.slice(0,4).map(()=>'<span class="dot"></span>').join('');
    cells+=`<div class="day ${state.calSelectedDate===dt?'selected':''}" data-date="${dt}"><span class="num">${d}</span><div class="dots">${dots}</div></div>`;
  }
  let detail='';
  if(state.calSelectedDate){
    const cov=state.bookings.filter(b=>bookingCoversDate(b,state.calSelectedDate));
    detail=`<div class="section-label">${state.calSelectedDate}</div><div class="list">`;
    if(cov.length){
      detail+=cov.map(b=>{
        const total=Number(b.income)||0,ant=totalAbonado(b),rest=restanteDe(b);
        const horas=(b.horaEntrega||b.horaRecoleccion)?` · ${b.horaEntrega||'—'}→${b.horaRecoleccion||'—'}`:'';
        return`<div class="item">
          <div class="item-top"><div><div class="item-name">${esc(tituloEvento(b))}</div><div class="item-meta">${esc(b.client)}${b.telefono?' · '+esc(b.telefono):''}${horas}<br>Total ${fmtM(total)} · Anticipo ${fmtM(ant)} · Restante ${fmtM(rest)}</div></div></div>
          <div class="item-actions"><a class="btn btn-gcal btn-sm" href="${buildGCalUrl(b)}" target="_blank">📅 Calendar</a><button class="btn btn-whats btn-sm" data-wa-rec="${b.id}">💬</button></div>
        </div>`;
      }).join('');
    }else{detail+=`<div class="empty">Sin reservas este día.</div>`;}
    detail+=`</div>`;
  }
  return`
  <div class="card">
    <div class="cal-nav">
      <button class="btn btn-ghost btn-icon" id="calPrev">←</button>
      <div class="cal-month">${mName}</div>
      <button class="btn btn-ghost btn-icon" id="calNext">→</button>
    </div>
    <div class="cal-grid">
      ${dows.map(d=>`<div class="dow">${d}</div>`).join('')}${cells}
    </div>
  </div>${detail}`;
}

