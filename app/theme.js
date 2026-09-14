// ─── TEMA CLARO / OSCURO ────────────────────────────────
const SUN='<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>';
const MOON='<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>';
let themeMode='dark';
function setTheme(mode){
  themeMode=mode;
  document.body.classList.toggle('light',mode==='light');
  document.getElementById('themeIcon').innerHTML=mode==='light'?SUN:MOON;
  try{document.cookie='silverTheme='+mode+';max-age=31536000;path=/';}catch(e){}
}
function initTheme(){
  let saved='dark';
  try{
    const m=document.cookie.match(/silverTheme=(dark|light)/);
    if(m)saved=m[1];
    else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)saved='light';
  }catch(e){}
  setTheme(saved);
}
