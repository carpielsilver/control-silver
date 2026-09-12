import { kv } from '@vercel/kv';
const KEY = 'silver-app-data';

const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const NUMEROS = '0123456789'.split('');
const esLetraONum = (id) => ALFABETO.includes(id) || NUMEROS.includes(id);

const fmtM = (n) =>
  '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function nombreItem(id, inventory) {
  const inv = (inventory || []).find((x) => x.id === id);
  return inv ? inv.name : id;
}

function esCorona(id, inventory) {
  return String(id).toLowerCase().includes('corona') ||
         String(nombreItem(id, inventory)).toLowerCase().includes('corona');
}

function tieneCorona(b, inventory) {
  if (b.corona === true) return true;
  return (b.items || []).some((i) => !esLetraONum(i.itemId) && esCorona(i.itemId, inventory));
}

function textoLetras(b) {
  if (b.texto && String(b.texto).trim()) return String(b.texto).trim().toUpperCase();
  const ls = (b.items || []).filter((i) => esLetraONum(i.itemId));
  if (!ls.length) return 'Renta';
  return ls.map((i) => i.itemId.repeat(i.qty)).join('');
}

function letrasDeReserva(b, inventory) {