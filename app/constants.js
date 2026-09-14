const WA='525665350389';
const ALFABETO='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const NUMEROS='0123456789'.split('');
const DEF_CATS=['Inversión','Mantenimiento','Publicidad','Otro'];
const PROJ_TIPOS=['Mueble','Closet','Puerta','Otro'];
const PROJ_ST=['En espera','En proceso','Terminado','Entregado'];
const MAT_UNITS=['pza','hoja','m','m²','ml','kg','lt','rollo','tramo','juego','servicio'];

const ICONS={
  dashboard:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  inventario:'<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M3 11h18"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  reservas:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  calendario:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  finanzas:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  carpinteria:'<path d="M3 21l6-6M14 7l3-3 4 4-3 3M3 21l4-1 10-10-3-3L4 17l-1 4z"/>',
  contrato:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/>',
};

