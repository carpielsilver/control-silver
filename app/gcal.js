// ─── GOOGLE CALENDAR ───────────────────────────────────
function esLetraONum(id){return ALFABETO.includes(id)||NUMEROS.includes(id);}
function nombreItem(id){const inv=state.inventory.find(x=>x.id===id);return inv?inv.name:id;}
function esCorona(id){return String(id).toLowerCase().includes('corona')||String(nombreItem(id)).toLowerCase().includes('corona');}
function tieneCorona(b){
  if(b.corona===true)return true;
  return(b.items||[]).some(i=>!esLetraONum(i.itemId)&&esCorona(i.itemId));
}
function textoLetras(b){
  if(b.texto&&String(b.texto).trim())return String(b.texto).trim().toUpperCase();
  const ls=(b.items||[]).filter(i=>esLetraONum(i.itemId));
  if(!ls.length)return'Renta';
  return ls.map(i=>i.itemId.repeat(i.qty)).join('');
}
function letrasDeReserva(b){return textoLetras(b)+(tieneCorona(b)?' 👑':'');}
function extrasDeReserva(b){
  return(b.items||[]).filter(i=>!esLetraONum(i.itemId)&&!esCorona(i.itemId))
    .map(i=>i.qty>1?`${nombreItem(i.itemId)} ×${i.qty}`:nombreItem(i.itemId)).join(', ');
}
function ubicacionCorta(b){
  const u=(b.lugar&&String(b.lugar).trim())||(b.direccion&&String(b.direccion).trim())||'';
  return u||'Sin ubicación';
}
function tituloEvento(b){return`${letrasDeReserva(b)} — ${b.client||'Cliente'}`;}
function detalleEvento(b){
  const total=Number(b.income)||0,ant=totalAbonado(b),rest=restanteDe(b);
  const extras=extrasDeReserva(b);
  return[
    `Cliente: ${b.client||'—'}`,
    `Letras: ${letrasDeReserva(b)}`,
    extras?`Extras: ${extras}`:null,
    `Ubicación: ${b.direccion||'—'}`,
    `Teléfono: ${b.telefono||'—'}`,
    `Costo total: ${fmtM(total)}`,
    `Anticipo: ${fmtM(ant)}`,
    `Restante: ${fmtM(rest)}`,
    (b.horaEntrega||b.horaRecoleccion)?`Entrega: ${b.horaEntrega||'—'} · Recolección: ${b.horaRecoleccion||'—'}`:null,
    b.notes?`Notas: ${b.notes}`:null
  ].filter(Boolean).join('\n');
}
function buildGCalUrl(b){
  const start=b.dateStart.replace(/-/g,'');
  const end=addDays(b.dateEnd,1).replace(/-/g,'');
  const title=encodeURIComponent(tituloEvento(b));
  const det=encodeURIComponent(detalleEvento(b));
  const loc=encodeURIComponent(b.direccion||'');
  return`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${det}&location=${loc}`;
}

