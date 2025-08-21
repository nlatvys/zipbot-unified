import data from "@/data/pilot.json"
export function getZipData(zip){ return data[zip] || null }
export function getSafeZip(s){ const m=(s||'').match(/^\d{5}$/); return m?m[0]:null }
