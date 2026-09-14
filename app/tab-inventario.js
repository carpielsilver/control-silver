// ─── INVENTARIO ────────────────────────────────────────
function invOpts(){
  const cur=state.invSelType==='otra'?'otra':`${state.invSelKind}:${state.invSelValue}`;
  const l=ALFABETO.map(l=>`<option value="letra:${l}" ${cur==='letra:'+l?'selected':''}>Letra ${l}</option>`).join('');
  const n=NUMEROS.map(n=>`<option value="numero:${n}" ${cur==='numero:'+n?'selected':''}>Número ${n}</option>`).join('');
  return`<optgroup label="Letras">${l}</optgroup><optgroup label="Números">${n}</optgroup><option value="otra" ${cur==='otra'?'selected':''}>Otra pieza...</option>`;
}
function renderInventario(){
  const letras=state.inventory.filter(i=>i.isLetter&&ALFABETO.includes(i.id));
  const numeros=state.inventory.filter(i=>i.isLetter&&NUMEROS.includes(i.id));
  const custom=state.inventory.filter(i=>!i.isLetter);
  const tile=it=>{
    const stock=it.total;
    const cls=stock===0?'tile-empty':stock<=2?'tile-low':'tile-ok';
    return`<button class="ftile ${cls}" data-editqty="${it.id}">
      <span class="ftile-ch">${esc(it.name)}</span>
      <span class="ftile-n">${stock}</span>
    </button>`;
  };
  const customItems=custom.map(it=>`<div class="item">
    <div class="item-top">
      <div><div class="item-name">${esc(it.name)} <span style="color:var(--text-3);font-weight:400;font-size:0.72rem">(accesorio)</span></div>
      <div class="item-meta">${it.total===0?'Sin stock':it.total+' disponibles'}</div></div>
      <span class="pill ${it.total===0?'pill-bad':'pill-ok'}">${it.total}</span>
    </div>
    <div class="item-actions">
      <button class="btn btn-ghost btn-sm" data-editqty="${it.id}">Editar cantidad</button>
      <button class="btn btn-danger btn-sm" data-delcustom="${it.id}">Eliminar</button>
    </div>
  </div>`).join('');
  const total=letras.length+numeros.length+custom.length;
  const enStock=[...letras,...numeros,...custom].filter(i=>i.total>0).length;
  const sumLetras=letras.reduce((s,i)=>s+(Number(i.total)||0),0);
  const sumNumeros=numeros.reduce((s,i)=>s+(Number(i.total)||0),0);
  const sumAccesorios=custom.reduce((s,i)=>s+(Number(i.total)||0),0);
  const sumTotal=sumLetras+sumNumeros+sumAccesorios;
  const costoPiezas=[...letras,...numeros,...custom].reduce((s,it)=>s+(Number(it.total)||0)*(Number(it.costoUnit)||0),0);
  const costoMantenimiento=state.expenses.filter(e=>e.category==='Mantenimiento').reduce((s,e)=>s+(Number(e.amount)||0),0);
  const totalInvertido=costoPiezas+costoMantenimiento;
  const conCosto=[...letras,...numeros,...custom].filter(i=>Number(i.costoUnit)>0).length;
  return`
  <div class="card">
    <div class="card-title">Existencias</div>
    <div class="card-sub">Cuántas piezas físicas tienes de cada tipo</div>
    <div class="stat-grid">
      <div class="stat income"><div class="lbl">Letras</div><div class="val">${sumLetras}</div></div>
      <div class="stat info"><div class="lbl">Números</div><div class="val">${sumNumeros}</div></div>
      <div class="stat warn"><div class="lbl">Accesorios</div><div class="val">${sumAccesorios}</div></div>
      <div class="stat profit"><div class="lbl">Total piezas</div><div class="val">${sumTotal}</div></div>
    </div>
  </div>
  <div class="card fpanel">
    <div class="fpanel-head">
      <span class="fpanel-dot"></span>
      <span class="fpanel-title">PANEL DE INVENTARIO</span>
      <span class="fpanel-sub">${enStock}/${total} activas</span>
    </div>
    <div class="fgrid-label">Letras</div>
    <div class="ftile-grid">${letras.map(tile).join('')}</div>
    <div class="fgrid-label">Números</div>
    <div class="ftile-grid ftile-grid-num">${numeros.map(tile).join('')}</div>
    <div class="fpanel-legend">
      <span><i class="fdot fdot-ok"></i> Stock ok</span>
      <span><i class="fdot fdot-low"></i> Stock bajo</span>
      <span><i class="fdot fdot-empty"></i> Sin stock</span>
    </div>
  </div>
  <div class="card">
    <div class="card-title">💰 Inversión total</div>
    <div class="card-sub">Piezas (cantidad × costo) + gastos de Mantenimiento registrados en Finanzas</div>
    <div class="stat-grid">
      <div class="stat neutral"><div class="lbl">Piezas</div><div class="val">${fmtM(costoPiezas)}</div></div>
      <div class="stat warn"><div class="lbl">Mantenimiento</div><div class="val">${fmtM(costoMantenimiento)}</div></div>
    </div>
    <div class="stat profit" style="margin-bottom:4px"><div class="lbl">Total invertido</div><div class="val">${fmtM(totalInvertido)}</div></div>
    ${conCosto<total?`<div class="msg msg-info" style="margin-top:12px;margin-bottom:0">${conCosto}/${total} piezas tienen costo. Usa "Precio base" abajo para ponerlo a todas de un jalón.</div>`:''}
  </div>
  <div class="card">
    <div class="card-title">Precio base para letras y números</div>
    <div class="card-sub">Si casi todas cuestan lo mismo, ponlo aquí una vez y aplícalo a todas. Las que sean diferentes las ajustas individualmente abajo.</div>
    <label>Costo por pieza (letras y números)</label>
    <input type="number" id="invBaseCost" min="0" placeholder="Ej. 350">
    <button class="btn btn-ghost btn-block" id="invApplyBaseBtn">Aplicar a todas las letras y números</button>
  </div>
  <div class="card">
    <div class="card-title">Actualizar cantidad o costo individual</div>
    <label>Pieza</label>
    <select id="invSel">${invOpts()}</select>
    ${state.invSelType==='otra'?'<label>Nombre</label><input type="text" id="invCustomName" placeholder="Ej. Corazón">':''}
    <label>Cantidad total</label>
    <input type="number" id="invQty" min="0" placeholder="0">
    <label>Costo por unidad (opcional)</label>
    <input type="number" id="invCosto" min="0" placeholder="Ej. 350" value="${(()=>{const it=state.invSelType==='otra'?null:state.inventory.find(i=>i.id===state.invSelValue);return it&&it.costoUnit?it.costoUnit:'';})()}">
    <button class="btn btn-primary btn-block" id="invSaveBtn">Guardar cantidad</button>
  </div>
  <div class="card">
    <div class="card-title">🔌 Agregar accesorio</div>
    <div class="card-sub">Extensiones, multicontactos, coronas, u otras piezas que no sean letras/números.</div>
    <label>Nombre</label>
    <input type="text" id="accName" placeholder="Ej. Extensión 10m">
    <div class="row">
      <div><label>Cantidad</label><input type="number" id="accQty" min="0" placeholder="0"></div>
      <div><label>Costo unitario</label><input type="number" id="accCosto" min="0" placeholder="Opcional"></div>
    </div>
    <button class="btn btn-primary btn-block" id="accSaveBtn">Agregar / actualizar accesorio</button>
  </div>
  ${custom.length?`<div class="section-label">Accesorios registrados</div><div class="list">${customItems}</div>`:''}
  <div class="card">
    <div class="card-title">🔧 Reparaciones y mantenimiento</div>
    <div class="card-sub">Registra cuando una pieza se descompone o se repara, para saber cuáles fallan más seguido.</div>
    ${state.repMsg?`<div class="msg msg-ok">${state.repMsg}</div>`:''}
    <label>Pieza</label>
    <select id="repPieza">
      <option value="">Selecciona...</option>
      <optgroup label="Letras">${ALFABETO.map(l=>`<option value="${l}" ${state.repPieza===l?'selected':''}>Letra ${l}</option>`).join('')}</optgroup>
      <optgroup label="Números">${NUMEROS.map(n=>`<option value="${n}" ${state.repPieza===n?'selected':''}>Número ${n}</option>`).join('')}</optgroup>
      ${custom.length?`<optgroup label="Accesorios">${custom.map(it=>`<option value="${it.id}" ${state.repPieza===it.id?'selected':''}>${esc(it.name)}</option>`).join('')}</optgroup>`:''}
    </select>
    <label>Fecha</label>
    <input type="date" id="repFecha" value="${state.repFecha||todayISO()}">
    <label>¿Qué se le hizo?</label>
    <input type="text" id="repDesc" value="${esc(state.repDesc)}" placeholder="Ej. Foco quemado, se cambió">
    <label>Costo de la reparación (opcional)</label>
    <input type="number" id="repCosto" min="0" value="${esc(state.repCosto)}" placeholder="0">
    <button class="btn btn-primary btn-block" id="repSaveBtn">Registrar reparación</button>
    ${state.repairs.length?`<div class="section-label">Historial reciente</div><div class="list">${[...state.repairs].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,15).map(r=>{
      const pieza=state.inventory.find(i=>i.id===r.itemId);
      return`<div class="item">
        <div class="item-top"><div><div class="item-name">${pieza?esc(pieza.name):r.itemId}</div><div class="item-meta">${r.fecha}${r.desc?' · '+esc(r.desc):''}</div></div>${r.costo?`<span class="item-val">${fmtM(r.costo)}</span>`:''}</div>
        <div class="item-actions"><button class="btn btn-danger btn-sm" data-delrep="${r.id}">Eliminar</button></div>
      </div>`;
    }).join('')}</div>`:'<div class="empty">Sin reparaciones registradas.</div>'}
  </div>`;
}

