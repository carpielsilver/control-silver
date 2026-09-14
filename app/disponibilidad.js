// ─── DISPONIBILIDAD ────────────────────────────────────
function datesInRange(s,e){
  const out=[];let d=new Date(s+'T00:00:00');const end=new Date(e+'T00:00:00');
  while(d<=end){out.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}
  return out;
}
function bookingCoversDate(b,dt){return b.status==='confirmed'&&dt>=b.dateStart&&dt<=b.dateEnd;}
function usageOnDate(itemId,dt,exId){
  let t=0;
  for(const b of state.bookings){
    if(b.id===exId||!bookingCoversDate(b,dt))continue;
    const it=b.items.find(i=>i.itemId===itemId);if(it)t+=it.qty;
  }
  return t;
}
function minAvailable(itemId,s,e,exId){
  const item=state.inventory.find(i=>i.id===itemId);if(!item)return 0;
  const dates=datesInRange(s,e);let min=item.total;
  for(const d of dates){min=Math.min(min,item.total-usageOnDate(itemId,d,exId));}
  return min;
}

// ─── CONTRATO URL ──────────────────────────────────────
function buildContratoCarpUrl(p){
  const q=new URLSearchParams({nombre:p.cliente||'',telefono:p.telefono||'',direccion:p.direccion||'',
    proyecto:p.nombre||'',tipo:p.tipo||'',descripcion:p.notas||'',fechaInicio:p.fechaInicio||'',
    fechaEntrega:p.fechaEntrega||'',costo:p.presupuesto||'',anticipo:p.anticipo||''});
  return'contrato-carpinteria.html?'+q.toString();
}
function buildContratoUrl(b){
  const letras=b.items.map(i=>{const inv=state.inventory.find(x=>x.id===i.itemId);const n=inv?inv.name:i.itemId;return i.qty>1?`${n}(${i.qty})`:n;}).join(' ');
  const p=new URLSearchParams({nombre:b.client||'',telefono:b.telefono||'',fechaEvento:b.dateStart||'',
    direccion:b.direccion||'',letras,horaEntrega:b.horaEntrega||'',horaRecoleccion:b.horaRecoleccion||'',
    costo:b.income||'',anticipo:totalAbonado(b)||'',metodo:b.metodo||''});
  return'contrato.html?'+p.toString();
}

