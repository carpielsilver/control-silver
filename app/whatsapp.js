// ─── WHATSAPP REMINDER ─────────────────────────────────
function sendWaRecordatorio(bookingId){
  const b=state.bookings.find(x=>x.id===bookingId);if(!b||!b.telefono)return alert('Esta reserva no tiene teléfono registrado.');
  const saldo=restanteDe(b);
  const msg=`Hola ${b.client}! 👋 Te recordamos que el *${b.dateStart}* es tu evento con letras gigantes.\n\n`+
    `📍 Dirección de entrega: ${b.direccion||'por confirmar'}\n`+
    (b.horaEntrega?`🕐 Hora de entrega: *${b.horaEntrega}*\n`:'')+
    (b.horaRecoleccion?`🕐 Hora de recolección: *${b.horaRecoleccion}*\n`:'')+
    (saldo>0?`\n💰 Saldo pendiente: *${fmtM(saldo)}*\n`:'\n✅ Tu pago está completo.\n')+
    `\nCualquier duda, con gusto te atendemos. ¡Nos vemos! 🎉`;
  const num=b.telefono.replace(/\D/g,'');
  window.open(`https://wa.me/${num.startsWith('52')?num:'52'+num}?text=${encodeURIComponent(msg)}`,'_blank');
}

