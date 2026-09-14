// ─── PERSISTENCIA ──────────────────────────────────────
async function loadData(){
  setSync('Cargando','');
  try{
    const res=await fetch('/api/data');
    if(!res.ok)throw new Error('HTTP '+res.status);
    const d=await res.json();
    state.inventory=d.inventory||[];state.bookings=d.bookings||[];
    state.expenses=d.expenses||[];state.expCategories=d.expCategories||[];
    state.projects=d.projects||[];state.cotizaciones=d.cotizaciones||[];
    state.materials=d.materials||[];state.photos=d.photos||{};state.repairs=d.repairs||[];
    setSync('Sincronizado','ok');
  }catch(e){console.error(e);setSync('Sin conexión','err');}
  seedInv();render();
}
async function saveData(){
  setSync('Guardando...','');
  try{
    const r=await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({inventory:state.inventory,bookings:state.bookings,expenses:state.expenses,
        expCategories:state.expCategories,projects:state.projects,cotizaciones:state.cotizaciones,
        materials:state.materials,photos:state.photos,repairs:state.repairs})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    setSync('Sincronizado','ok');
  }catch(e){console.error(e);setSync('No se guardó','err');}
}
function setSync(text,cls){
  const el=document.getElementById('syncStatus');
  const t=document.getElementById('syncText');
  if(!el)return;
  t.textContent=text;
  el.className='sync-dot '+(cls||'');
}
function seedInv(){
  if(!state.inventory.some(i=>i.isLetter)){
    const seed=[...ALFABETO,...NUMEROS].map(ch=>({id:ch,name:ch,total:0,isLetter:true}));
    state.inventory=[...seed,...state.inventory.filter(i=>!i.isLetter)];saveData();
  }
}

