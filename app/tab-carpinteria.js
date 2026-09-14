// ─── CARPINTERÍA ───────────────────────────────────────
function statusBadge(s){
  const m={'En espera':'pill-neutral','En proceso':'pill-warn','Terminado':'pill-info','Entregado':'pill-ok'};
  return`<span class="pill ${m[s]||'pill-neutral'}">${s}</span>`;
}
function catalogoOrdenado(){return[...state.materials].sort((a,b)=>String(a.nombre||'').localeCompare(String(b.nombre||''),'es'));}
function buscarMaterial(nombre){
  const n=String(nombre||'').trim().toLowerCase();if(!n)return null;
  return state.materials.find(m=>String(m.nombre||'').trim().toLowerCase()===n)
      ||state.materials.find(m=>String(m.nombre||'').toLowerCase().includes(n))||null;
}
function totalMateriales(p){return(p.materiales||[]).reduce((s,r)=>s+(Number(r.cantidad)||0)*(Number(r.precio)||0),0);}
function calcGasto(p){
  const presup=Number(p.presupuesto)||0,ant=Number(p.anticipo)||0;
  const gasto=(p.materiales&&p.materiales.length)?totalMateriales(p):(Number(p.gastoMateriales)||0);
  return{presup,ant,gasto,quedaAnt:ant-gasto,quedaTotal:presup-gasto,porCobrar:presup-ant};
}
function montoColor(n){return n<0?'#ef8b6f':'#9dc491';}
function textoQueda(n){return n<0?`${fmtM(Math.abs(n))} de más`:fmtM(n);}
function pintaGasto(p){
  const c=calcGasto(p);
  const ga=document.querySelector(`[data-ga="${p.id}"]`);
  const gt=document.querySelector(`[data-gt="${p.id}"]`);
  if(ga){ga.textContent=textoQueda(c.quedaAnt);ga.style.color=montoColor(c.quedaAnt);}
  if(gt){gt.textContent=textoQueda(c.quedaTotal);gt.style.color=montoColor(c.quedaTotal);}
}
function renderCarpinteria(){
  const ti=state.projects.reduce((s,p)=>s+(Number(p.presupuesto)||0),0);
  const ta=state.projects.reduce((s,p)=>s+(Number(p.anticipo)||0),0);
  const tg=state.projects.reduce((s,p)=>s+calcGasto(p).gasto,0);
  const projItems=state.projects.length===0?`<div class="empty">Sin proyectos aún.</div>`:
    [...state.projects].sort((a,b)=>b.fechaInicio.localeCompare(a.fechaInicio)).map(p=>{
      const saldo=(Number(p.presupuesto)||0)-(Number(p.anticipo)||0);
      const photoSrc=state.photos[p.id];
      return`<div class="item">
        <div class="item-top">
          <div style="min-width:0"><div class="item-name">${esc(p.nombre)}</div><div class="item-meta">${esc(p.cliente)} · ${esc(p.tipo)}</div></div>
          ${photoSrc?`<img src="${photoSrc}" class="proj-photo" data-view-photo="${p.id}">`:statusBadge(p.status)}
        </div>
        ${photoSrc?`<div style="margin-top:6px">${statusBadge(p.status)}</div>`:''}
        <div class="item-meta" style="margin-top:8px">Presupuesto ${fmtM(p.presupuesto)} · Anticipo ${fmtM(p.anticipo)} · Saldo <b style="color:${saldo>0?'#ef8b6f':'#9dc491'}">${fmtM(saldo)}</b></div>
        ${p.fechaEntrega?`<div class="item-meta">Entrega: ${p.fechaEntrega}</div>`:''}
        ${(()=>{const c=calcGasto(p);const mats=p.materiales||[];return`<div class="gasto-box">
          <div class="gasto-head"><span>Materiales del proyecto</span><b class="mono-amber">${fmtM(c.gasto)}</b></div>
          ${mats.length?`<div class="mat-lines">${mats.map((r,i)=>`<div class="mat-line"><span class="ml-n">${esc(r.nombre)}<i>${r.cantidad} ${esc(r.unidad||'')} × ${fmtM(r.precio)}</i></span><span class="ml-v"><b>${fmtM((Number(r.cantidad)||0)*(Number(r.precio)||0))}</b><button class="mat-x" data-delmatproj="${p.id}" data-idx="${i}">×</button></span></div>`).join('')}</div>`:''}
          <div class="mat-add">
            <input type="text" list="matCatalogo" data-matname="${p.id}" placeholder="Material de tu lista">
            <input type="number" min="0" step="any" data-matqty="${p.id}" placeholder="Cant.">
            <button class="btn btn-primary btn-sm" data-addmat="${p.id}">+</button>
          </div>
          ${mats.length?'':`<div class="gasto-head" style="margin-top:9px"><span>O anota el gasto a mano</span><input type="number" min="0" inputmode="decimal" data-gasto="${p.id}" value="${p.gastoMateriales??''}" placeholder="0"></div>`}
          <div class="q-row" style="border-top:1px solid var(--line);margin-top:7px;padding-top:8px"><span class="l">Me queda del anticipo</span><b data-ga="${p.id}" style="color:${montoColor(c.quedaAnt)}">${textoQueda(c.quedaAnt)}</b></div>
          <div class="q-row"><span class="l">Me queda del total</span><b data-gt="${p.id}" style="color:${montoColor(c.quedaTotal)}">${textoQueda(c.quedaTotal)}</b></div>
          <div class="q-row"><span class="l">Falta por cobrar</span><b>${fmtM(c.porCobrar)}</b></div>
        </div>`;})()}
        <div class="item-actions">
          ${PROJ_ST.filter(s=>s!==p.status).map(s=>`<button class="btn btn-ghost btn-sm" data-setstatus="${p.id}" data-val="${s}">→ ${s}</button>`).join('')}
          <a class="btn btn-contract btn-sm" href="${buildContratoCarpUrl(p)}" target="_blank">📄 Contrato</a>
          <label class="btn btn-ghost btn-sm" style="cursor:pointer">📷<input type="file" accept="image/*" capture="environment" data-photo-proj="${p.id}" style="display:none"></label>
          <button class="btn btn-danger btn-sm" data-delproj="${p.id}">Eliminar</button>
        </div>
      </div>`;
    }).join('');
  const tiposOpts=PROJ_TIPOS.map(t=>`<option ${state.pjTipo===t?'selected':''}>${t}</option>`).join('');
  const stOpts=PROJ_ST.map(s=>`<option ${state.pjStatus===s?'selected':''}>${s}</option>`).join('');
  const filtro=String(state.matBuscar||'').trim().toLowerCase();
  const catalogo=catalogoOrdenado().filter(m=>!filtro||String(m.nombre||'').toLowerCase().includes(filtro));
  const matItems=catalogo.map(m=>`<div class="item">
      <div class="item-top">
        <div style="min-width:0"><div class="item-name">${esc(m.nombre)}</div><div class="item-meta">precio por ${esc(m.unidad||'pza')}</div></div>
        <input type="number" min="0" step="any" class="mat-precio" data-matprecio="${m.id}" value="${m.precio??m.precioUnit??''}" placeholder="0">
      </div>
      <div class="item-actions"><button class="btn btn-danger btn-sm" data-mat-del="${m.id}">Eliminar</button></div>
    </div>`).join('');

  return`
  <div class="stat-grid">
    <div class="stat neutral"><div class="lbl">Proyectos</div><div class="val">${state.projects.length}</div></div>
    <div class="stat warn"><div class="lbl">En proceso</div><div class="val">${state.projects.filter(p=>p.status==='En proceso').length}</div></div>
    <div class="stat income"><div class="lbl">Presupuestado</div><div class="val">${fmtM(ti)}</div></div>
    <div class="stat profit"><div class="lbl">Anticipo cobrado</div><div class="val">${fmtM(ta)}</div></div>
    <div class="stat expense"><div class="lbl">Gasto materiales</div><div class="val">${fmtM(tg)}</div></div>
    <div class="stat neutral"><div class="lbl">Por cobrar</div><div class="val">${fmtM(ti-ta)}</div></div>
  </div>
  ${state.pjMsg?`<div class="msg msg-ok">${state.pjMsg}</div>`:''}
  <div class="card">
    <div class="card-title">Contrato en blanco</div>
    <div class="card-sub">Ábrelo sin ligarlo a ningún proyecto y llénalo a mano — ya trae tus datos y tu firma.</div>
    <a class="btn btn-contract btn-block" href="contrato-carpinteria.html" target="_blank">📄 Abrir contrato en blanco</a>
  </div>
  <div class="section-label">Proyectos</div>
  <div class="list">${projItems}</div>
  <div class="card">
    <div class="card-title">Nuevo proyecto</div>
    <label>Cliente</label><input type="text" id="pjClient" value="${esc(state.pjClient)}" placeholder="Nombre">
    <div class="row">
      <div><label>Teléfono</label><input type="tel" id="pjTelefono" value="${esc(state.pjTelefono)}" placeholder="55..."></div>
      <div><label>Dirección</label><input type="text" id="pjDireccion" value="${esc(state.pjDireccion)}" placeholder="Domicilio del trabajo"></div>
    </div>
    <label>Nombre del proyecto</label><input type="text" id="pjNombre" value="${esc(state.pjNombre)}" placeholder="Ej. Closet principal">
    <div class="row">
      <div><label>Tipo</label><select id="pjTipo">${tiposOpts}</select></div>
      <div><label>Estado</label><select id="pjStatus">${stOpts}</select></div>
    </div>
    <label>Presupuesto total</label><input type="number" id="pjPresupuesto" min="0" value="${esc(state.pjPresupuesto)}" placeholder="5000">
    <label>Anticipo recibido</label><input type="number" id="pjAnticipo" min="0" value="${esc(state.pjAnticipo)}" placeholder="2500">
    <div class="row">
      <div><label>Materiales (gasto)</label><input type="number" id="pjMateria" min="0" value="${esc(state.pjMateria)}" placeholder="Opcional"></div>
      <div><label>Mano de obra</label><input type="number" id="pjMano" min="0" value="${esc(state.pjMano)}" placeholder="Opcional"></div>
    </div>
    <div class="row">
      <div><label>Fecha inicio</label><input type="date" id="pjFechaInicio" value="${state.pjFechaInicio||todayISO()}"></div>
      <div><label>Fecha entrega</label><input type="date" id="pjFechaEntrega" value="${esc(state.pjFechaEntrega)}"></div>
    </div>
    <label>Descripción del trabajo</label>
    <div class="card-sub">Esto es lo que aparece en el contrato: medidas, acabados, materiales, lo que incluye y lo que no.</div>
    <textarea id="pjNotas" rows="3" placeholder="Ej. Closet de 2.40 x 2.40 m en MDF 18mm color nogal, 4 puertas corredizas, 6 entrepaños, tubo para colgar e instalación incluida.">${esc(state.pjNotas)}</textarea>
    <button class="btn btn-primary btn-block" id="addProjBtn">Guardar proyecto</button>
  </div>
  <div class="card">
    <div class="card-title">Lista de precios de materiales</div>
    <div class="card-sub">Tu catálogo de precios. No controla existencias: sirve para que al armar un proyecto solo escribas el material y la cantidad.</div>
    ${state.matMsg?`<div class="msg msg-ok">${state.matMsg}</div>`:''}
    <input type="text" id="matBuscar" value="${esc(state.matBuscar)}" placeholder="🔍 Buscar en tu lista">
    <div class="list" style="margin-bottom:14px">${state.materials.length?(matItems||'<div class="empty">Nada con ese nombre.</div>'):'<div class="empty">Tu lista está vacía. Agrégalos abajo o pega tu lista completa.</div>'}</div>
    <label>Material</label><input type="text" id="matNombre" value="${esc(state.matNombre)}" placeholder="Ej. MDF 18mm">
    <div class="row">
      <div><label>Unidad</label><select id="matUnidad">${MAT_UNITS.map(u=>`<option ${state.matUnidad===u?'selected':''}>${u}</option>`).join('')}</select></div>
      <div><label>Precio por unidad</label><input type="number" id="matPrecio" min="0" step="any" value="${esc(state.matPrecio)}" placeholder="850"></div>
    </div>
    <button class="btn btn-primary btn-block" id="addMatBtn">Agregar a la lista</button>
    <div style="margin-top:18px;border-top:1px solid var(--line);padding-top:14px">
      <label>Subir tu lista completa</label>
      <div class="card-sub">Una línea por material: <b>nombre, unidad, precio</b>. Ejemplo:<br>MDF 18mm, hoja, 850<br>Bisagra cazoleta, pza, 28<br>Si el material ya existe, solo se actualiza el precio.</div>
      <textarea id="matImport" rows="5" placeholder="MDF 18mm, hoja, 850">${esc(state.matImport)}</textarea>
      <button class="btn btn-ghost btn-block" id="importMatBtn">Importar lista</button>
    </div>
  </div>
  <datalist id="matCatalogo">${catalogoOrdenado().map(m=>`<option value="${esc(m.nombre)}">`).join('')}</datalist>`;
}

