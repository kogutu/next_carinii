// Adresy zdjęć z Magento/Typesense mają podwójny ukośnik w ścieżce (https://sklep.carinii.com.pl//media/...).
// Optymalizator obrazów na Vercelu odrzuca takie adresy (INVALID_IMAGE_OPTIMIZE_REQUEST), więc zwijamy
// powtórzone ukośniki w ścieżce. Protokół (https://) i adresy względne zostają bez zmian.
export const normalizeMediaUrl = (url: string): string => (url ? url.replace(/([^:/])\/{2,}/g, '$1/') : url)
