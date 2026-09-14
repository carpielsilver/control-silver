document.getElementById('themeToggle').onclick=()=>setTheme(themeMode==='light'?'dark':'light');
initTheme();

// ─── RELOJ EN VIVO (dashboard) ──────────────────────────
setInterval(()=>{
  const el=document.getElementById('liveClock');
  if(el)el.textContent=new Date().toLocaleTimeString('es-MX',{hour:'numeric',minute:'2-digit'});
},30000);

loadData();
