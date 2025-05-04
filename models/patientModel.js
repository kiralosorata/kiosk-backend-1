import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DATA_DIR  = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'patients.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

function load() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}
export function getById(id) {
  const list = load();
  return list.find(p => p.id === id) || null;
}

export function getAll() {
  return load();
}

export function add(patient) {
  const list = load();
  list.push(patient);
  save(list);
  return patient;
}

export function updateStatus(id, status) {
  const list = load();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  list[idx].status = status;
  save(list);
  return list[idx];
}


// add at bottom of the file
export function remove(id) {
    const list = load();
    const idx  = list.findIndex(p => p.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    save(list);
    return true;
  }

  export function updateVitals(id, vitals, newEsi, newReason) {
    const list = load();
    const idx  = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
  
    // 1️⃣ keep the prior ESI/reason AND the prior vitals in history
    list[idx].vitalsHistory = list[idx].vitalsHistory || [];
    list[idx].vitalsHistory.push({
      when     : Date.now(),
      esi      : list[idx].esi,
      reason   : list[idx].reason,
      vitals   : list[idx].vitals || {},
    });
  
    // 2️⃣ overwrite with the new assessment
    list[idx].vitals  = vitals;      // { bp, hr, rr, temp, spo2 }
    list[idx].esi     = newEsi;
    list[idx].reason  = newReason;
    list[idx].status  = 'ongoing';
  
    save(list);
    return list[idx];
  }
  

  