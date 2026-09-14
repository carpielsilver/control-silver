function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function fmtM(n){return'$'+(Number(n)||0).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0});}
function todayISO(){return new Date().toISOString().slice(0,10);}
function esc(s){const d=document.createElement('div');d.textContent=s??'';return d.innerHTML;}
function allCats(){return[...new Set([...DEF_CATS,...state.expCategories])];}
function addDays(iso,n){const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);}
function semanaActual(){
  const hoy=new Date(todayISO()+'T00:00:00');
  const dow=hoy.getDay(); // 0=domingo..6=sábado
  const offsetLunes=dow===0?-6:1-dow;
  const lunes=new Date(hoy);lunes.setDate(hoy.getDate()+offsetLunes);
  const domingo=new Date(lunes);domingo.setDate(lunes.getDate()+6);
  return{inicio:lunes.toISOString().slice(0,10),fin:domingo.toISOString().slice(0,10)};
}
function tocaSemana(b,semana){return b.dateStart<=semana.fin&&b.dateEnd>=semana.inicio;}
function abonosDe(b){
  if(b.abonos&&b.abonos.length)return b.abonos;
  const legacy=[];
  if(Number(b.anticipo)>0)legacy.push({id:'legacy-ant',fecha:b.dateStart,monto:Number(b.anticipo),metodo:b.metodo||''});
  if(b.saldoPagado){
    const rest=(Number(b.income)||0)-(Number(b.anticipo)||0);
    if(rest>0)legacy.push({id:'legacy-saldo',fecha:b.dateStart,monto:rest,metodo:b.metodoSaldo||''});
  }
  return legacy;
}
function totalAbonado(b){return abonosDe(b).reduce((s,a)=>s+(Number(a.monto)||0),0);}
function restanteDe(b){return Math.max(0,(Number(b.income)||0)-totalAbonado(b));}
function estaLiquidado(b){return restanteDe(b)<=0;}
function registrarAbono(id,monto,metodo){
  const b=state.bookings.find(x=>x.id===id);if(!b)return;
  monto=Math.round(Number(monto)||0);
  if(monto<=0)return;
  if(!b.abonos)b.abonos=abonosDe(b);
  b.abonos.push({id:uid(),fecha:todayISO(),monto,metodo:metodo||''});
  saveData();render();
}
function abonosEnRango(ini,fin){
  const out=[];
  for(const b of state.bookings){
    if(b.status!=='confirmed')continue;
    for(const a of abonosDe(b))if(a.fecha>=ini&&a.fecha<=fin)out.push({...a,client:b.client});
  }
  return out;
}
// Fila para abonar (parcial o total) directo desde una tarjeta de reserva
function abonoWidget(b){
  const rest=restanteDe(b);
  if(rest<=0)return'';
  return`<div class="abono-row">
    <input type="number" min="1" max="${rest}" value="${rest}" class="abono-input" data-abonoinput="${b.id}">
    <button class="btn btn-warn btn-sm" data-abonar="${b.id}" data-metodo="Efectivo">💵 Abonar</button>
    <button class="btn btn-warn btn-sm" data-abonar="${b.id}" data-metodo="Tarjeta">💳 Abonar</button>
  </div>`;
}
// Pagos de antes del sistema de abonos que quedaron sin método (efectivo/tarjeta) asignado
function fijarMetodoAbono(bookingId,entryId,metodo){
  const b=state.bookings.find(x=>x.id===bookingId);if(!b)return;
  if(!b.abonos)b.abonos=abonosDe(b);
  const entry=b.abonos.find(a=>a.id===entryId);if(!entry)return;
  entry.metodo=metodo;
  saveData();render();
}
function editarMontoAbono(bookingId,entryId,nuevoMonto){
  const b=state.bookings.find(x=>x.id===bookingId);if(!b)return;
  if(!b.abonos)b.abonos=abonosDe(b);
  nuevoMonto=Math.round(Number(nuevoMonto)||0);
  if(nuevoMonto<=0)return eliminarAbono(bookingId,entryId);
  const entry=b.abonos.find(a=>a.id===entryId);if(!entry)return;
  entry.monto=nuevoMonto;
  saveData();render();
}
function eliminarAbono(bookingId,entryId){
  const b=state.bookings.find(x=>x.id===bookingId);if(!b)return;
  if(!b.abonos)b.abonos=abonosDe(b);
  b.abonos=b.abonos.filter(a=>a.id!==entryId);
  saveData();render();
}
// Lista editable de todos los abonos de una reserva: monto, método y borrar
function abonosListWidget(b){
  const abonos=abonosDe(b);
  if(!abonos.length)return'';
  return`<div class="abono-list">
    <div class="abono-list-title">Abonos registrados</div>
    ${abonos.map(a=>`<div class="abono-line">
      <span class="al-fecha">${a.fecha}</span>
      <input type="number" min="0" class="al-monto" data-editabono="${b.id}:${a.id}" value="${a.monto}">
      <select class="al-metodo" data-editabonometodo="${b.id}:${a.id}">
        <option value="" ${!a.metodo?'selected':''}>Sin especificar</option>
        <option value="Efectivo" ${a.metodo==='Efectivo'?'selected':''}>💵 Efectivo</option>
        <option value="Tarjeta" ${a.metodo==='Tarjeta'?'selected':''}>💳 Tarjeta</option>
        <option value="Transferencia" ${a.metodo==='Transferencia'?'selected':''}>Transferencia</option>
      </select>
      <button class="al-x" data-delabono="${b.id}:${a.id}">×</button>
    </div>`).join('')}
  </div>`;
}

