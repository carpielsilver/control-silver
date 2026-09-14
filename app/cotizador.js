// ─── COTIZADOR ─────────────────────────────────────────
function getPPU(n){if(n===1)return 400;if(n<=3)return 350;if(n<=6)return 300;return 290;}
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,'').trim();}
const LUGARES=[
  {km:0,kw:['chalco','chalco centro','san martin chalco']},
  {km:6,kw:['valle de chalco','xico']},{km:6,kw:['cocotitlan']},{km:9,kw:['temamatla']},
  {km:11,kw:['tlalmanalco']},{km:13,kw:['tenango del aire']},{km:14,kw:['ayapango']},
  {km:16,kw:['juchitepec']},{km:18,kw:['amecameca']},{km:24,kw:['ozumba']},
  {km:26,kw:['ecatzingo']},{km:12,kw:['ixtapaluca']},
  {km:15,kw:['los reyes la paz','la paz']},{km:20,kw:['chimalhuacan']},
  {km:27,kw:['nezahualcoyotl','neza']},{km:22,kw:['iztapalapa']},{km:18,kw:['tlahuac']},
  {km:25,kw:['xochimilco']},{km:30,kw:['milpa alta']},{km:26,kw:['texcoco']},
  {km:28,kw:['chicoloapan']},{km:30,kw:['chiautla']},{km:33,kw:['coyoacan']},
  {km:35,kw:['benito juarez','del valle','narvarte']},
  {km:32,kw:['centro historico','zocalo']},{km:38,kw:['cuauhtemoc','roma','condesa']},
  {km:30,kw:['iztacalco']},{km:40,kw:['azcapotzalco']},{km:42,kw:['gustavo a madero','gam']},
  {km:36,kw:['venustiano carranza']},{km:45,kw:['alvaro obregon']},{km:48,kw:['cuajimalpa']},
  {km:50,kw:['magdalena contreras']},{km:47,kw:['tlalpan']},{km:50,kw:['polanco','miguel hidalgo']},
];
function geoLugar(dir){
  const t=norm(dir);if(!t)return null;
  let best=null,maxL=0;
  for(const l of LUGARES)for(const k of l.kw){
    const kn=norm(k);
    if((t.includes(kn)||kn.includes(t))&&kn.length>maxL){maxL=kn.length;best={km:l.km,nombre:k};}
  }
  return best;
}
function calcQ(lc,corona,km){
  if(lc===0)return null;
  const ppu=getPPU(lc),lt=lc*ppu,cg=lc>8,cc=corona&&!cg?ppu:0,fc=km>5?km*15:0;
  return{ppu,letrasTotal:lt,coronaGratis:cg,coronaCosto:cc,fleteCosto:fc,total:lt+cc+fc};
}
function letterBD(texto){
  const chars=texto.replace(/\s/g,'').toUpperCase().split('');
  const counts={};chars.forEach(c=>counts[c]=(counts[c]||0)+1);
  return{counts,total:chars.length};
}

