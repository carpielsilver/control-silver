// ─── PDF REPORT ────────────────────────────────────────
function descargarRespaldo(){
  const backup={
    fecha:new Date().toISOString(),
    bookings:state.bookings,inventory:state.inventory,materials:state.materials,
    projects:state.projects,expenses:state.expenses,expCategories:state.expCategories,
    cotizaciones:state.cotizaciones,
  };
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`respaldo-carpinteria-el-silver-${todayISO()}.json`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function generarPDF(){
  if(!window.jspdf){alert('Cargando PDF, intenta de nuevo.');return;}
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  const today=todayISO();
  const summary=computeSummary('mes').slice(0,12);
  doc.setFontSize(18);doc.setTextColor(217,154,78);
  doc.text('Reporte Financiero — Carpintería el Silver',14,20);
  doc.setFontSize(10);doc.setTextColor(100,80,60);
  doc.text(`Generado: ${today}`,14,28);
  let y=38;
  doc.setFontSize(12);doc.setTextColor(28,20,16);
  doc.text('Resumen por mes',14,y);y+=8;
  doc.setFontSize(9);doc.setTextColor(150,140,120);
  doc.text('Mes',14,y);doc.text('Ingresos',70,y);doc.text('Gastos',110,y);doc.text('Utilidad',150,y);y+=6;
  doc.setDrawColor(220,213,197);doc.line(14,y,196,y);y+=5;
  doc.setTextColor(28,20,16);
  for(const r of summary){
    doc.setFontSize(9);
    doc.text(r.period,14,y);
    doc.text(fmtM(r.income),70,y);
    doc.text(fmtM(r.expense),110,y);
    doc.setTextColor(r.profit>=0?46:192,r.profit>=0?125:57,r.profit>=0?79:43);
    doc.text(fmtM(r.profit),150,y);
    doc.setTextColor(28,20,16);
    y+=7;if(y>270){doc.addPage();y=20;}
  }
  y+=5;doc.line(14,y,196,y);y+=8;
  const ti=summary.reduce((s,r)=>s+r.income,0);
  const te=summary.reduce((s,r)=>s+r.expense,0);
  doc.setFontSize(11);doc.setTextColor(217,154,78);
  doc.text(`Total ingresos: ${fmtM(ti)}   Total gastos: ${fmtM(te)}   Utilidad: ${fmtM(ti-te)}`,14,y);
  y+=12;
  const catTotals={};for(const e of state.expenses)catTotals[e.category]=(catTotals[e.category]||0)+(Number(e.amount)||0);
  if(Object.keys(catTotals).length){
    doc.setFontSize(12);doc.setTextColor(28,20,16);doc.text('Gastos por categoría',14,y);y+=8;
    for(const[cat,amt]of Object.entries(catTotals).sort((a,b)=>b[1]-a[1])){
      doc.setFontSize(9);doc.text(`• ${cat}`,14,y);doc.text(fmtM(amt),100,y);y+=7;
    }
  }
  doc.save(`reporte-silver-${today}.pdf`);
}

