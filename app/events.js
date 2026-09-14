// ─── EVENTOS ───────────────────────────────────────────
function bindEvents(){
  const invSel=document.getElementById('invSel');
  if(invSel)invSel.onchange=()=>{const v=invSel.value;state.invSelType=v==='otra'?'otra':'letra';if(v!=='otra'){const[kind,val]=v.split(':');state.invSelKind=kind;state.invSelValue=val;}render();};
  const repPiezaEl=document.getElementById('repPieza');if(repPiezaEl)repPiezaEl.onchange=()=>state.repPieza=repPiezaEl.value;
  const repFechaEl=document.getElementById('repFecha');if(repFechaEl)repFechaEl.onchange=()=>state.repFecha=repFechaEl.value;
  const repDescEl=document.getElementById('repDesc');if(repDescEl)repDescEl.oninput=()=>state.repDesc=repDescEl.value;
  const repCostoEl=document.getElementById('repCosto');if(repCostoEl)repCostoEl.oninput=()=>state.repCosto=repCostoEl.value;
  const repSaveBtn=document.getElementById('repSaveBtn');
  if(repSaveBtn)repSaveBtn.onclick=()=>{
    const pieza=document.getElementById('repPieza').value;
    if(!pieza)return alert('Selecciona la pieza.');
    const fecha=document.getElementById('repFecha').value||todayISO();
    const desc=document.getElementById('repDesc').value.trim();
    const costo=document.getElementById('repCosto').value;
    state.repairs.push({id:uid(),itemId:pieza,fecha,desc,costo:costo!==''?parseFloat(costo):0});
    state.repPieza='';state.repFecha='';state.repDesc='';state.repCosto='';
    state.repMsg='Reparación registrada ✓';saveData();render();setTimeout(()=>{state.repMsg=null;render();},2000);
  };
  document.querySelectorAll('[data-delrep]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar este registro?')){state.repairs=state.repairs.filter(r=>r.id!==b.dataset.delrep);saveData();render();}});
  const accSaveBtn=document.getElementById('accSaveBtn');
  if(accSaveBtn)accSaveBtn.onclick=()=>{
    const name=document.getElementById('accName').value.trim();
    const qty=parseInt(document.getElementById('accQty').value);
    const costo=document.getElementById('accCosto').value;
    if(!name)return alert('Escribe el nombre del accesorio.');
    if(isNaN(qty)||qty<0)return alert('Cantidad inválida.');
    const ex=state.inventory.find(i=>!i.isLetter&&i.name.toLowerCase()===name.toLowerCase());
    if(ex){ex.total=qty;if(costo!=='')ex.costoUnit=parseFloat(costo);}
    else state.inventory.push({id:uid(),name,total:qty,isLetter:false,costoUnit:costo!==''?parseFloat(costo):0});
    saveData();render();
  };
  const invApplyBase=document.getElementById('invApplyBaseBtn');
  if(invApplyBase)invApplyBase.onclick=()=>{
    const val=parseFloat(document.getElementById('invBaseCost').value);
    if(isNaN(val)||val<0)return alert('Escribe un costo válido.');
    if(!confirm(`¿Aplicar ${fmtM(val)} como costo a las ${ALFABETO.length+NUMEROS.length} letras y números?`))return;
    state.inventory.forEach(it=>{if(it.isLetter)it.costoUnit=val;});
    saveData();render();
  };
  const invSave=document.getElementById('invSaveBtn');
  if(invSave)invSave.onclick=()=>{
    const qty=parseInt(document.getElementById('invQty').value);
    if(isNaN(qty)||qty<0)return alert('Cantidad inválida');
    const costoInput=document.getElementById('invCosto');
    const costo=costoInput&&costoInput.value!==''?parseFloat(costoInput.value):null;
    const sel=document.getElementById('invSel').value;
    if(sel==='otra'){
      const name=document.getElementById('invCustomName')?.value.trim();
      if(!name)return alert('Escribe el nombre');
      const ex=state.inventory.find(i=>!i.isLetter&&i.name.toLowerCase()===name.toLowerCase());
      if(ex){ex.total=qty;if(costo!==null)ex.costoUnit=costo;}
      else state.inventory.push({id:uid(),name,total:qty,isLetter:false,costoUnit:costo||0});
    }else{const[,val]=sel.split(':');const it=state.inventory.find(i=>i.id===val);if(it){it.total=qty;if(costo!==null)it.costoUnit=costo;}}
    saveData();render();
  };
  document.querySelectorAll('[data-editqty]').forEach(b=>b.onclick=()=>{
    const it=state.inventory.find(i=>i.id===b.dataset.editqty);
    const nq=prompt(`Nueva cantidad para "${it.name}":`,it.total);
    if(nq!==null&&!isNaN(parseInt(nq))){it.total=parseInt(nq);saveData();render();}
  });
  document.querySelectorAll('[data-delcustom]').forEach(b=>b.onclick=()=>{
    if(confirm('¿Eliminar?')){state.inventory=state.inventory.filter(i=>i.id!==b.dataset.delcustom);saveData();render();}
  });

  const bind=(id,key)=>{const el=document.getElementById(id);if(el)el.oninput=()=>state[key]=el.value;};
  bind('bkClient','bkClient');bind('bkTelefono','bkTelefono');bind('bkAnticipo','bkAnticipo');
  const bkFreq=document.getElementById('bkFreqClient');
  if(bkFreq)bkFreq.onchange=()=>{
    const v=bkFreq.value;
    if(!v){return;}
    const found=getFrequentClients().find(c=>(c.telefono||c.client)===v);
    if(found){state.bkClient=found.client;state.bkTelefono=found.telefono||'';render();}
  };
  const bkT=document.getElementById('bkTexto');
  if(bkT)bkT.oninput=()=>{state.bkTexto=bkT.value;state.bkIncomeOverride=null;render();focusEnd('bkTexto');};
  const bkC=document.getElementById('bkCorona');
  if(bkC)bkC.onchange=()=>{state.bkCorona=bkC.checked;state.bkIncomeOverride=null;render();};
  const bkD=document.getElementById('bkDireccion');
  if(bkD)bkD.oninput=()=>{
    state.bkDireccion=bkD.value;
    if(!bkD.value.trim()){state.bkGeoStatus='idle';state.bkKm='';state.bkLugar='';}
    else{const m=geoLugar(bkD.value);if(m){state.bkKm=String(m.km);state.bkLugar=m.nombre;state.bkGeoStatus='ok';}else{state.bkGeoStatus='error';state.bkKm='';state.bkLugar='';}}
    render();focusEnd('bkDireccion');
  };
  const bkKmEl=document.getElementById('bkKm');if(bkKmEl)bkKmEl.oninput=()=>{state.bkKm=bkKmEl.value;render();focusEnd('bkKm');};
  const bkS=document.getElementById('bkStart');if(bkS)bkS.onchange=()=>{state.bkStart=bkS.value;if(!state.bkEnd||state.bkEnd<state.bkStart)state.bkEnd=state.bkStart;render();};
  const bkE=document.getElementById('bkEnd');if(bkE)bkE.onchange=()=>state.bkEnd=bkE.value;
  const bkHE=document.getElementById('bkHoraEntrega');if(bkHE)bkHE.oninput=()=>state.bkHoraEntrega=bkHE.value;
  const bkHR=document.getElementById('bkHoraRecoleccion');if(bkHR)bkHR.oninput=()=>state.bkHoraRecoleccion=bkHR.value;
  const bkM=document.getElementById('bkMetodo');if(bkM)bkM.onchange=()=>state.bkMetodo=bkM.value;
  const bkN=document.getElementById('bkNotes');if(bkN)bkN.oninput=()=>state.bkNotes=bkN.value;
  const bkI=document.getElementById('bkIncome');if(bkI)bkI.oninput=()=>state.bkIncomeOverride=bkI.value===''?null:parseFloat(bkI.value);
  document.querySelectorAll('[data-bi-check]').forEach(cb=>cb.onchange=()=>{const id=cb.dataset.biCheck;state.bookingItemSel[id]=state.bookingItemSel[id]||{checked:false,qty:1};state.bookingItemSel[id].checked=cb.checked;});
  document.querySelectorAll('[data-bi-qty]').forEach(inp=>inp.onchange=()=>{const id=inp.dataset.biQty;state.bookingItemSel[id]=state.bookingItemSel[id]||{checked:false,qty:1};state.bookingItemSel[id].qty=Math.max(1,parseInt(inp.value)||1);});
  const wBtn=document.getElementById('whatsBtn');if(wBtn)wBtn.onclick=sendWaQuote;
  const sCotBtn=document.getElementById('saveCotBtn');if(sCotBtn)sCotBtn.onclick=saveCotizacion;
  const chkBtn=document.getElementById('checkBookBtn');if(chkBtn)chkBtn.onclick=tryReservar;
  document.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{if(confirm('¿Cancelar reserva?')){const bk=state.bookings.find(x=>x.id===b.dataset.cancel);bk.status='cancelled';saveData();render();}});
  document.querySelectorAll('[data-delbooking]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar esta reserva por completo? Esto no se puede deshacer.')){state.bookings=state.bookings.filter(x=>x.id!==b.dataset.delbooking);saveData();render();}});
  document.querySelectorAll('[data-editbooking]').forEach(b=>b.onclick=()=>editBooking(b.dataset.editbooking));
  const cancelEditBtn=document.getElementById('cancelEditBtn');
  if(cancelEditBtn)cancelEditBtn.onclick=()=>{
    state.editingBookingId=null;
    state.bkClient='';state.bkTelefono='';state.bkTexto='';state.bkCorona=false;state.bkDireccion='';state.bkKm='';
    state.bkGeoStatus='idle';state.bkLugar='';state.bkHoraEntrega='';state.bkHoraRecoleccion='';state.bkAnticipo='';state.bkMetodo='';state.bkNotes='';state.bkIncomeOverride=null;state.bookingItemSel={};
    state.bookingMsg=null;render();
  };
  document.querySelectorAll('[data-abonar]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.abonar;
    const input=document.querySelector(`[data-abonoinput="${id}"]`);
    registrarAbono(id,input?input.value:0,btn.dataset.metodo);
  });
  document.querySelectorAll('[data-metfiltro]').forEach(el=>el.onclick=()=>{
    state.dashFiltroMetodo=state.dashFiltroMetodo===el.dataset.metfiltro?null:el.dataset.metfiltro;render();
  });
  document.querySelectorAll('[data-editabono]').forEach(inp=>inp.onchange=()=>{
    const[bookingId,entryId]=inp.dataset.editabono.split(':');
    editarMontoAbono(bookingId,entryId,inp.value);
  });
  document.querySelectorAll('[data-editabonometodo]').forEach(sel=>sel.onchange=()=>{
    const[bookingId,entryId]=sel.dataset.editabonometodo.split(':');
    fijarMetodoAbono(bookingId,entryId,sel.value);
  });
  document.querySelectorAll('[data-delabono]').forEach(btn=>btn.onclick=()=>{
    const[bookingId,entryId]=btn.dataset.delabono.split(':');
    if(confirm('¿Eliminar este abono?'))eliminarAbono(bookingId,entryId);
  });
  document.querySelectorAll('[data-wa-rec]').forEach(b=>b.onclick=()=>sendWaRecordatorio(b.dataset.waRec));
  document.querySelectorAll('[data-viewbooking]').forEach(b=>b.onclick=()=>editBooking(b.dataset.viewbooking));
  document.querySelectorAll('[data-cot-conv]').forEach(b=>b.onclick=()=>convertCotizacion(b.dataset.cotConv));
  document.querySelectorAll('[data-cot-rej]').forEach(b=>b.onclick=()=>{const c=state.cotizaciones.find(x=>x.id===b.dataset.cotRej);if(c){c.status='rechazada';saveData();render();}});
  document.querySelectorAll('[data-cot-del]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar cotización?')){state.cotizaciones=state.cotizaciones.filter(c=>c.id!==b.dataset.cotDel);saveData();render();}});

  const cPrev=document.getElementById('calPrev');if(cPrev)cPrev.onclick=()=>{state.calMonth--;if(state.calMonth<0){state.calMonth=11;state.calYear--;}render();};
  const cNext=document.getElementById('calNext');if(cNext)cNext.onclick=()=>{state.calMonth++;if(state.calMonth>11){state.calMonth=0;state.calYear++;}render();};
  document.querySelectorAll('[data-date]').forEach(d=>d.onclick=()=>{state.calSelectedDate=state.calSelectedDate===d.dataset.date?null:d.dataset.date;render();});

  document.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{state.finGroupBy=b.dataset.group;render();});
  const addExp=document.getElementById('addExpBtn');
  if(addExp)addExp.onclick=()=>{
    const date=document.getElementById('expDate').value;
    const cat=document.getElementById('expCat').value;
    const amt=parseFloat(document.getElementById('expAmt').value);
    const desc=document.getElementById('expDesc').value.trim();
    if(!date||!amt||amt<=0)return alert('Revisa fecha y monto.');
    state.expenses.push({id:uid(),date,category:cat,amount:amt,description:desc});saveData();render();
  };
  document.querySelectorAll('[data-delexp]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar?')){state.expenses=state.expenses.filter(e=>e.id!==b.dataset.delexp);saveData();render();}});
  const addCat=document.getElementById('addCatBtn');
  if(addCat)addCat.onclick=()=>{
    const n=document.getElementById('newCatName').value.trim();
    if(!n)return alert('Escribe un nombre.');
    if(allCats().map(c=>c.toLowerCase()).includes(n.toLowerCase()))return alert('Ya existe.');
    state.expCategories.push(n);saveData();render();
  };
  document.querySelectorAll('[data-delcat]').forEach(b=>b.onclick=()=>{state.expCategories=state.expCategories.filter(c=>c!==b.dataset.delcat);saveData();render();});
  const pdfBtn=document.getElementById('pdfBtn');if(pdfBtn)pdfBtn.onclick=generarPDF;
  const backupBtn=document.getElementById('backupBtn');if(backupBtn)backupBtn.onclick=descargarRespaldo;

  const bpj=(id,key)=>{const el=document.getElementById(id);if(el)el.oninput=()=>state[key]=el.value;};
  bpj('pjClient','pjClient');bpj('pjTelefono','pjTelefono');bpj('pjDireccion','pjDireccion');bpj('pjNombre','pjNombre');bpj('pjPresupuesto','pjPresupuesto');
  bpj('pjAnticipo','pjAnticipo');bpj('pjMateria','pjMateria');bpj('pjMano','pjMano');bpj('pjNotas','pjNotas');
  const pjT=document.getElementById('pjTipo');if(pjT)pjT.onchange=()=>state.pjTipo=pjT.value;
  const pjSt=document.getElementById('pjStatus');if(pjSt)pjSt.onchange=()=>state.pjStatus=pjSt.value;
  const pjFI=document.getElementById('pjFechaInicio');if(pjFI)pjFI.onchange=()=>state.pjFechaInicio=pjFI.value;
  const pjFE=document.getElementById('pjFechaEntrega');if(pjFE)pjFE.onchange=()=>state.pjFechaEntrega=pjFE.value;
  const addProj=document.getElementById('addProjBtn');
  if(addProj)addProj.onclick=()=>{
    if(!state.pjClient.trim()||!state.pjNombre.trim())return alert('Escribe cliente y nombre.');
    state.projects.push({id:uid(),cliente:state.pjClient,telefono:state.pjTelefono,direccion:state.pjDireccion,nombre:state.pjNombre,tipo:state.pjTipo,materiales:[],presupuesto:state.pjPresupuesto,anticipo:state.pjAnticipo,costoMateriales:state.pjMateria,gastoMateriales:state.pjMateria,costoMano:state.pjMano,status:state.pjStatus,fechaInicio:state.pjFechaInicio||todayISO(),fechaEntrega:state.pjFechaEntrega,notas:state.pjNotas});
    state.pjClient='';state.pjTelefono='';state.pjDireccion='';state.pjNombre='';state.pjPresupuesto='';state.pjAnticipo='';state.pjMateria='';state.pjMano='';state.pjNotas='';state.pjFechaEntrega='';
    state.pjMsg='Proyecto guardado ✓';saveData();render();setTimeout(()=>{state.pjMsg=null;render();},2500);
  };
  document.querySelectorAll('[data-gasto]').forEach(inp=>{
    const aplica=guardar=>{
      const p=state.projects.find(x=>x.id===inp.dataset.gasto);if(!p)return;
      p.gastoMateriales=inp.value===''?'':Number(inp.value)||0;
      pintaGasto(p);
      if(guardar)saveData();
    };
    inp.oninput=()=>aplica(false);
    inp.onchange=()=>aplica(true);
    inp.onblur=()=>aplica(true);
  });
  document.querySelectorAll('[data-setstatus]').forEach(b=>b.onclick=()=>{const p=state.projects.find(x=>x.id===b.dataset.setstatus);if(p){p.status=b.dataset.val;saveData();render();}});
  document.querySelectorAll('[data-delproj]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar proyecto?')){state.projects=state.projects.filter(p=>p.id!==b.dataset.delproj);delete state.photos[b.dataset.delproj];saveData();render();}});
  document.querySelectorAll('[data-photo-proj]').forEach(inp=>inp.onchange=()=>{
    const file=inp.files[0];if(!file)return;
    const pid=inp.dataset.photoProj;
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        const max=600;
        let w=img.width,h=img.height;
        if(w>max||h>max){if(w>h){h=Math.round(h*max/w);w=max;}else{w=Math.round(w*max/h);h=max;}}
        canvas.width=w;canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        state.photos[pid]=canvas.toDataURL('image/jpeg',0.7);
        saveData();render();
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll('[data-view-photo]').forEach(img=>img.onclick=()=>{
    const src=state.photos[img.dataset.viewPhoto];if(!src)return;
    const ov=document.createElement('div');
    ov.style='position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
    ov.innerHTML=`<img src="${src}" style="max-width:92vw;max-height:85vh;border-radius:14px;">`;
    ov.onclick=()=>ov.remove();document.body.appendChild(ov);
  });

  bpj('matNombre','matNombre');bpj('matPrecio','matPrecio');bpj('matImport','matImport');
  const matB=document.getElementById('matBuscar');
  if(matB)matB.oninput=()=>{state.matBuscar=matB.value;render();focusEnd('matBuscar');};
  const bkF=document.getElementById('bkFiltroInput');
  if(bkF)bkF.oninput=()=>{state.bkFiltro=bkF.value;render();focusEnd('bkFiltroInput');};
  const matU=document.getElementById('matUnidad');if(matU)matU.onchange=()=>state.matUnidad=matU.value;
  const addMat=document.getElementById('addMatBtn');
  if(addMat)addMat.onclick=()=>{
    const nom=state.matNombre.trim();
    if(!nom)return alert('Escribe el nombre del material.');
    const ya=state.materials.find(m=>String(m.nombre||'').trim().toLowerCase()===nom.toLowerCase());
    if(ya){ya.unidad=state.matUnidad;ya.precio=Number(state.matPrecio)||0;state.matMsg='Precio actualizado ✓';}
    else{state.materials.push({id:uid(),nombre:nom,unidad:state.matUnidad,precio:Number(state.matPrecio)||0});state.matMsg='Material agregado ✓';}
    state.matNombre='';state.matPrecio='';
    saveData();render();setTimeout(()=>{state.matMsg=null;render();},2000);
  };
  const impMat=document.getElementById('importMatBtn');
  if(impMat)impMat.onclick=()=>{
    const txt=String(state.matImport||'').trim();
    if(!txt)return alert('Pega tu lista primero.');
    let nuevos=0,actualizados=0;
    for(const linea of txt.split(/\n/)){
      const partes=linea.split(/[,;\t|]/).map(x=>x.trim()).filter(x=>x!=='');
      if(!partes.length)continue;
      const nombre=partes[0];
      if(!nombre)continue;
      let unidad='pza',precio=0;
      if(partes.length>=3){unidad=partes[1];precio=parseFloat(String(partes[2]).replace(/[^0-9.]/g,''))||0;}
      else if(partes.length===2){precio=parseFloat(String(partes[1]).replace(/[^0-9.]/g,''))||0;}
      const ya=state.materials.find(m=>String(m.nombre||'').trim().toLowerCase()===nombre.toLowerCase());
      if(ya){ya.precio=precio;if(partes.length>=3)ya.unidad=unidad;actualizados++;}
      else{state.materials.push({id:uid(),nombre,unidad,precio});nuevos++;}
    }
    state.matImport='';
    state.matMsg=`${nuevos} agregados · ${actualizados} actualizados ✓`;
    saveData();render();setTimeout(()=>{state.matMsg=null;render();},3000);
  };
  document.querySelectorAll('[data-matprecio]').forEach(inp=>{
    const guarda=()=>{const m=state.materials.find(x=>x.id===inp.dataset.matprecio);if(m){m.precio=Number(inp.value)||0;saveData();}};
    inp.onchange=guarda;inp.onblur=guarda;
  });
  document.querySelectorAll('[data-addmat]').forEach(b=>b.onclick=()=>{
    const pid=b.dataset.addmat;
    const p=state.projects.find(x=>x.id===pid);if(!p)return;
    const nomInp=document.querySelector(`[data-matname="${pid}"]`);
    const qtyInp=document.querySelector(`[data-matqty="${pid}"]`);
    const nom=(nomInp&&nomInp.value||'').trim();
    const cant=Number(qtyInp&&qtyInp.value)||0;
    if(!nom)return alert('Escribe el material.');
    if(cant<=0)return alert('Escribe cuánto necesitas.');
    const m=buscarMaterial(nom);
    if(!m)return alert(`"${nom}" no está en tu lista de precios. Agrégalo primero abajo.`);
    p.materiales=p.materiales||[];
    p.materiales.push({matId:m.id,nombre:m.nombre,unidad:m.unidad||'pza',precio:Number(m.precio)||0,cantidad:cant});
    saveData();render();
  });
  document.querySelectorAll('[data-delmatproj]').forEach(b=>b.onclick=()=>{
    const p=state.projects.find(x=>x.id===b.dataset.delmatproj);if(!p)return;
    p.materiales.splice(Number(b.dataset.idx),1);saveData();render();
  });
  document.querySelectorAll('[data-mat-del]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar?')){state.materials=state.materials.filter(m=>m.id!==b.dataset.matDel);saveData();render();}});
}

function focusEnd(id){const el=document.getElementById(id);if(el){el.focus();const v=el.value;el.value='';el.value=v;}}

function sendWaQuote(){
  const bd=letterBD(state.bkTexto);const km=parseFloat(state.bkKm)||0;const res=calcQ(bd.total,state.bkCorona,km);
  if(!res)return;
  const anticipo=state.bkAnticipo&&Number(state.bkAnticipo)>0?Number(state.bkAnticipo):Math.round(res.total*0.5);
  const msg=encodeURIComponent(`¡Hola! 👋 Aquí tienes tu cotización de letras gigantes:\n\n📝 Letras: "${state.bkTexto}"${state.bkCorona?' + Corona 👑':''}\n📍 Entrega: ${state.bkDireccion||'—'} (~${km} km)\n\n💰 *Costo total: ${fmtM(res.total)} MXN*\n💵 *Anticipo para apartar la fecha: ${fmtM(anticipo)} MXN*\n\nCon el anticipo tu fecha queda reservada. ¡Quedo al pendiente! 🎉`);
  window.open(`https://wa.me/${WA}?text=${msg}`,'_blank');
}
function saveCotizacion(){
  const bd=letterBD(state.bkTexto);const km=parseFloat(state.bkKm)||0;const res=calcQ(bd.total,state.bkCorona,km);
  if(!res)return;
  if(!state.bkClient.trim())return alert('Escribe el nombre del cliente.');
  state.cotizaciones.push({id:uid(),client:state.bkClient,telefono:state.bkTelefono,texto:state.bkTexto,corona:state.bkCorona,km,direccion:state.bkDireccion,quote:res.total,fecha:todayISO(),status:'pendiente',notes:state.bkNotes});
  state.bookingMsg={type:'ok',text:'Cotización guardada. Puedes convertirla en reserva cuando el cliente confirme.'};
  saveData();render();
}
function convertCotizacion(cotId){
  const cot=state.cotizaciones.find(c=>c.id===cotId);if(!cot)return;
  state.bkClient=cot.client;state.bkTelefono=cot.telefono;state.bkTexto=cot.texto;
  state.bkCorona=cot.corona;state.bkKm=String(cot.km);state.bkDireccion=cot.direccion;
  state.bkIncomeOverride=cot.quote;cot.status='confirmada';
  state.tab='reservas';state.bookingMsg={type:'info',text:'Cotización cargada. Revisa las fechas y confirma la reserva.'};
  render();window.scrollTo(0,0);
}
function editBooking(bookingId){
  const b=state.bookings.find(x=>x.id===bookingId);if(!b)return;
  state.editingBookingId=bookingId;
  state.bkClient=b.client;state.bkTelefono=b.telefono||'';
  const names=b.items.map(i=>{const inv=state.inventory.find(x=>x.id===i.itemId);return inv?inv.name:i.itemId;});
  // Reconstruir texto de letras a partir de items que son letras/números (no accesorios)
  const letraItems=b.items.filter(i=>ALFABETO.includes(i.itemId)||NUMEROS.includes(i.itemId));
  let texto='';
  for(const it of letraItems)texto+=it.itemId.repeat(it.qty);
  state.bkTexto=(b.texto&&String(b.texto).trim())?String(b.texto):texto;
  state.bkCorona=tieneCorona(b);
  state.bkDireccion=b.direccion||'';state.bkKm='';state.bkGeoStatus='idle';state.bkLugar='';
  if(b.direccion){const m=geoLugar(b.direccion);if(m){state.bkKm=String(m.km);state.bkLugar=m.nombre;state.bkGeoStatus='ok';}}
  state.bkStart=b.dateStart;state.bkEnd=b.dateEnd;
  state.bkHoraEntrega=b.horaEntrega||'';state.bkHoraRecoleccion=b.horaRecoleccion||'';
  state.bkAnticipo=b.anticipo||'';state.bkMetodo=b.metodo||'';state.bkNotes=b.notes||'';
  state.bkIncomeOverride=Number(b.income)||0;
  // Preseleccionar accesorios existentes
  state.bookingItemSel={};
  for(const it of b.items){
    if(!ALFABETO.includes(it.itemId)&&!NUMEROS.includes(it.itemId)){
      state.bookingItemSel[it.itemId]={checked:true,qty:it.qty};
    }
  }
  state.tab='reservas';state.bookingMsg={type:'info',text:'Editando la reserva. Ajusta lo que necesites y guarda los cambios.'};
  render();window.scrollTo(0,0);
}
function tryReservar(){
  const bd=letterBD(state.bkTexto);const km=parseFloat(state.bkKm)||0;const res=calcQ(bd.total,state.bkCorona,km);
  const client=state.bkClient.trim();
  const dateStart=state.bkStart||todayISO();const dateEnd=state.bkEnd||dateStart;
  const income=state.bkIncomeOverride!==null?state.bkIncomeOverride:(res?res.total:0);
  if(!client)return(state.bookingMsg={type:'err',text:'Escribe el nombre del cliente.'},render());
  if(bd.total===0)return(state.bookingMsg={type:'err',text:'Escribe el texto de las letras.'},render());
  if(dateEnd<dateStart)return(state.bookingMsg={type:'err',text:'Fecha fin no puede ser antes del inicio.'},render());
  const items=Object.entries(bd.counts).map(([id,qty])=>({itemId:id,qty}));
  const accSel=Object.entries(state.bookingItemSel).filter(([id,v])=>v.checked).map(([id,v])=>({itemId:id,qty:v.qty}));
  const allItems=[...items,...accSel];
  const problems=[];
  for(const it of allItems){
    const inv=state.inventory.find(i=>i.id===it.itemId);
    if(!inv){problems.push(`No tienes "${it.itemId}" en inventario.`);continue;}
    const avail=minAvailable(it.itemId,dateStart,dateEnd,state.editingBookingId);
    if(it.qty>avail)problems.push(`${inv.name}: pediste ${it.qty}, solo hay ${avail} disponibles.`);
  }
  if(problems.length)return(state.bookingMsg={type:'err',text:'Disponibilidad insuficiente:<br>'+problems.join('<br>')},render());
  if(state.editingBookingId){
    const b=state.bookings.find(x=>x.id===state.editingBookingId);
    if(b){
      const patch={client,telefono:state.bkTelefono,dateStart,dateEnd,items:allItems,income,texto:(state.bkTexto||'').trim().toUpperCase(),corona:!!state.bkCorona,lugar:state.bkLugar||'',direccion:state.bkDireccion,horaEntrega:state.bkHoraEntrega,horaRecoleccion:state.bkHoraRecoleccion,notes:state.bkNotes};
      if(!(b.abonos&&b.abonos.length)){patch.anticipo=state.bkAnticipo;patch.metodo=state.bkMetodo;}
      Object.assign(b,patch);
    }
    state.editingBookingId=null;
    state.bkClient='';state.bkTelefono='';state.bkTexto='';state.bkCorona=false;state.bkDireccion='';state.bkKm='';
    state.bkGeoStatus='idle';state.bkLugar='';state.bkHoraEntrega='';state.bkHoraRecoleccion='';state.bkAnticipo='';state.bkMetodo='';state.bkNotes='';state.bkIncomeOverride=null;state.bookingItemSel={};
    state.bookingMsg={type:'ok',text:`Cambios guardados para ${esc(client)}.`};
    saveData();render();
    return;
  }
  const nueva={id:uid(),client,telefono:state.bkTelefono,dateStart,dateEnd,items:allItems,income,texto:(state.bkTexto||'').trim().toUpperCase(),corona:!!state.bkCorona,lugar:state.bkLugar||'',direccion:state.bkDireccion,horaEntrega:state.bkHoraEntrega,horaRecoleccion:state.bkHoraRecoleccion,anticipo:state.bkAnticipo,metodo:state.bkMetodo,notes:state.bkNotes,status:'confirmed',saldoPagado:false};
  state.bookings.push(nueva);
  state.bkClient='';state.bkTelefono='';state.bkTexto='';state.bkCorona=false;state.bkDireccion='';state.bkKm='';
  state.bkGeoStatus='idle';state.bkLugar='';state.bkHoraEntrega='';state.bkHoraRecoleccion='';state.bkAnticipo='';state.bkMetodo='';state.bkNotes='';state.bkIncomeOverride=null;state.bookingItemSel={};
  state.bookingMsg={type:'ok',text:`¡Reserva confirmada para ${esc(client)}! Se abrió el contrato automáticamente.`};
  saveData();render();window.open(buildContratoUrl(nueva),'_blank');
}

