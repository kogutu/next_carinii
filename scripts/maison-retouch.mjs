// Retusz zdjęć strefy Maison przez OpenAI (odszumienie, usunięcie drobnych skaz, lekkie podkręcenie koloru).
//
//   node --env-file=.env.local scripts/maison-retouch.mjs --dry-run
//   node --env-file=.env.local scripts/maison-retouch.mjs --sku=M008-E50-000-000-000 --limit=3
//   node --env-file=.env.local scripts/maison-retouch.mjs --limit=3 --session-only
//   node --env-file=.env.local scripts/maison-retouch.mjs --first=5 --session-only   (5 pierwszych produktów jak na stronie)
//   node --env-file=.env.local scripts/maison-retouch.mjs            (wszystkie zdjęcia, z cache)
//
// Wymaga OPENAI_API_KEY w .env.local. Oryginały zostają nietknięte: wyniki trafiają do tmp/maison-retouch/,
// razem ze stroną przed/po (index.html) do akceptacji. Zdjęcie raz przetworzone nie jest wysyłane drugi raz
// (cache po skrócie pliku i wersji promptu) — --force wymusza ponowne przetworzenie.
// Klucza API nigdy nie wypisujemy.

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const TYPESENSE_URL = 'http://46.224.114.11:8108/collections/carinii_prs/documents/search'
const TYPESENSE_KEY = 'xyz'
const OUT_DIR = path.resolve('tmp/maison-retouch')
const MANIFEST = path.join(OUT_DIR, 'manifest.json')

const MODEL = process.env.MAISON_RETOUCH_MODEL?.trim() || 'gpt-image-1'
const QUALITY = process.env.MAISON_RETOUCH_QUALITY?.trim() || 'high'
const CONCURRENCY = 2
// Zmiana promptu unieważnia cache, więc wersję podbijamy razem z nim
const PROMPT_VERSION = 'v2'

// Retusz, nie generowanie: produkt ma wyglądać dokładnie tak samo jak na oryginale
const PROMPT = [
    'Retouch this fashion product photograph. Make only these changes:',
    '1) Remove image noise and grain, and smooth uneven areas of the background.',
    '2) Remove small blemishes: dust specks, scratches, tiny stains, scuffs, stray threads and wrinkles in the leather that are caused by photography, not by the design.',
    '3) Gently boost colour saturation by a small amount, so colours look slightly richer but stay true-to-life.',
    'Keep the overall tonal range, brightness and contrast IDENTICAL to the original: do not increase contrast, do not darken shadows, do not crush blacks. Black leather must keep all its visible detail, folds and highlights, exactly as bright as in the original.',
    'Keep the background colour and colour cast (for example a cool bluish-grey tone) exactly as in the original: do not neutralise, warm up or recolour the background or the white balance.',
    'Do NOT change the shoe or the model in any way: keep the exact shape, heel, sole, toe, buckles, zippers, studs, stitching, seams, embossing, logos, materials and texture of the leather.',
    'Do NOT change the composition, crop, pose, background, lighting direction or framing. Do not add, remove or restyle any objects. Keep faces and skin natural.',
    'The result must look like the same photograph, only cleaner and very slightly more colourful.',
].join(' ')

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const value = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')

const dryRun = flag('dry-run')
const force = flag('force')
const sessionOnly = flag('session-only')
const onlySku = value('sku')
const limit = Number(value('limit')) || Infinity
const firstProducts = Number(value('first')) || Infinity

// B<numer>-M-<numer>.jpg to packshoty na białym tle; reszta to zdjęcia z sesji (tak samo jak w lib/maison.ts)
const isPackshot = (url) => /\/B\d+-M-[^/]*\.jpe?g$/i.test(url)
const normalize = (url) => url.replace(/([^:/])\/{2,}/g, '$1/')

const fetchMaisonImages = async () => {
    const params = new URLSearchParams({
        q: '*',
        query_by: 'name',
        filter_by: `cids_all:=[344] && status:=true${onlySku ? ` && sku:=${onlySku}` : ''}`,
        include_fields: 'sku,imgs,cids_all',
        per_page: '100',
    })
    const response = await fetch(`${TYPESENSE_URL}?${params}`, { headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY } })
    if (!response.ok) throw new Error(`Typesense: ${response.status}`)
    const json = await response.json()

    // --first=N: tylko N pierwszych produktów w kolejności wyświetlania strefy Maison (jak compareProducts w lib/maison.ts)
    const rank = (doc) => {
        const gallery = (doc.imgs ?? []).map(normalize)
        const session = gallery.filter((url) => !isPackshot(url))
        const lead = session[0] ?? gallery[0] ?? ''
        const isBotki = (doc.cids_all ?? []).map(String).includes('345')
        return [isPackshot(lead) ? 1 : 0, isBotki ? 1 : 0, Number(doc.sku.slice(1, 4)) || 0]
    }
    const compare = (a, b) => {
        const ra = rank(a.document)
        const rb = rank(b.document)
        for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i]
        return a.document.sku.localeCompare(b.document.sku)
    }
    const hits = [...(json.hits ?? [])].sort(compare).slice(0, firstProducts)

    const jobs = []
    for (const hit of hits) {
        const { sku, imgs = [] } = hit.document
        imgs.map(normalize).forEach((url, index) => {
            if (sessionOnly && isPackshot(url)) return
            jobs.push({ sku, index, url })
        })
    }
    return jobs
}

const hashOf = (buffer) => createHash('sha256').update(buffer).update(`${MODEL}|${QUALITY}|${PROMPT_VERSION}`).digest('hex').slice(0, 16)

const readManifest = async () => (existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {})

const download = async (url) => {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CariniiRetouch/1.0)' } })
    if (!response.ok) throw new Error(`Pobranie ${url}: ${response.status}`)
    return Buffer.from(await response.arrayBuffer())
}

// Model przyjmuje 1024x1536 (2:3), więc wejście dopasowujemy do tego formatu; wynik wracamy do rozmiaru oryginału
const retouch = async (original) => {
    const meta = await sharp(original).metadata()
    const input = await sharp(original).resize(1024, 1536, { fit: 'contain', background: '#ffffff' }).png().toBuffer()

    const form = new FormData()
    form.append('model', MODEL)
    form.append('prompt', PROMPT)
    form.append('size', '1024x1536')
    form.append('quality', QUALITY)
    // nowsze modele (gpt-image-2+) zawsze trzymają się wejścia i odrzucają ten parametr
    if (MODEL.startsWith('gpt-image-1')) form.append('input_fidelity', 'high')
    form.append('output_format', 'png')
    form.append('image', new Blob([input], { type: 'image/png' }), 'photo.png')

    const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: form,
    })
    const json = await response.json().catch(() => null)
    if (!response.ok) throw new Error(`OpenAI ${response.status}: ${json?.error?.message ?? 'brak szczegółów'}`)

    const result = Buffer.from(json.data[0].b64_json, 'base64')
    const width = meta.width ?? 1080
    const height = meta.height ?? 1620
    return sharp(result).resize(width, height, { fit: 'fill', kernel: 'lanczos3' }).jpeg({ quality: 92, mozjpeg: true }).toBuffer()
}

const processJob = async (job, manifest) => {
    const key = `${job.sku}/${job.index}`
    const original = await download(job.url)
    const hash = hashOf(original)
    const file = `${job.sku}/${job.index}-${hash}.jpg`

    if (!force && manifest[key]?.hash === hash && existsSync(path.join(OUT_DIR, manifest[key].file))) {
        return { ...job, status: 'cache', file: manifest[key].file }
    }

    const output = await retouch(original)
    await mkdir(path.dirname(path.join(OUT_DIR, file)), { recursive: true })
    await writeFile(path.join(OUT_DIR, file), output)
    manifest[key] = { hash, file, source: job.url, at: new Date().toISOString() }
    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2))
    return { ...job, status: 'ok', file }
}

const buildReview = async (manifest) => {
    const rows = Object.entries(manifest)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(
            ([key, item]) => `
    <figure>
      <figcaption>${key}</figcaption>
      <div class="pair">
        <div><span>przed</span><img loading="lazy" src="${item.source}"></div>
        <div><span>po</span><img loading="lazy" src="${item.file}"></div>
      </div>
    </figure>`,
        )
        .join('')

    const html = `<!doctype html><html lang="pl"><meta charset="utf-8"><title>Maison — retusz przed/po</title>
<style>
  body{margin:0;padding:24px;background:#111;color:#eee;font:14px/1.4 system-ui,sans-serif}
  h1{font-size:18px}
  figure{margin:0 0 32px}
  figcaption{margin-bottom:8px;font-family:ui-monospace,monospace;color:#aaa}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .pair div{position:relative}
  .pair span{position:absolute;left:8px;top:8px;padding:2px 8px;background:#000a;font-size:12px}
  img{width:100%;display:block}
</style>
<h1>Maison — retusz przed/po (${Object.keys(manifest).length} zdjęć)</h1>${rows}`
    await writeFile(path.join(OUT_DIR, 'index.html'), html)
}

const runPool = async (jobs, worker) => {
    const results = []
    let next = 0
    const lane = async () => {
        while (next < jobs.length) {
            const job = jobs[next++]
            try {
                const result = await worker(job)
                console.log(`${result.status === 'ok' ? 'OK   ' : 'cache'} ${job.sku}/${job.index}`)
                results.push(result)
            } catch (error) {
                console.error(`BŁĄD  ${job.sku}/${job.index}: ${error.message}`)
                results.push({ ...job, status: 'error' })
            }
        }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, lane))
    return results
}

// --publish: kopiuje zaakceptowane wyniki do public/maison/retouched/ i zapisuje mapę SKU → zdjęcia w data/maison-retouched.json.
// Zakres wybierają te same flagi co przy przetwarzaniu (--first, --sku). Zdjęć bez wyniku (np. odrzuconych przez filtr) nie ruszamy.
const publish = async (jobs) => {
    const manifest = await readManifest()
    const publicDir = path.resolve('public/maison/retouched')
    const mapFile = path.resolve('data/maison-retouched.json')
    const map = existsSync(mapFile) ? JSON.parse(await readFile(mapFile, 'utf8')) : {}

    let copied = 0
    for (const job of jobs) {
        const item = manifest[`${job.sku}/${job.index}`]
        if (!item || !existsSync(path.join(OUT_DIR, item.file))) continue
        const name = path.basename(item.file)
        await mkdir(path.join(publicDir, job.sku), { recursive: true })
        await writeFile(path.join(publicDir, job.sku, name), await readFile(path.join(OUT_DIR, item.file)))
        map[job.sku] = { ...map[job.sku], [job.index]: `/maison/retouched/${job.sku}/${name}` }
        copied++
    }
    await writeFile(mapFile, `${JSON.stringify(map, null, 2)}\n`)
    console.log(`Opublikowano ${copied} zdjęć w public/maison/retouched/ (mapa: data/maison-retouched.json).`)
}

const main = async () => {
    const all = await fetchMaisonImages()
    const jobs = all.slice(0, limit)

    if (flag('publish')) return publish(jobs)
    const skus = new Set(jobs.map((job) => job.sku)).size
    console.log(`Zdjęć do przetworzenia: ${jobs.length} (produktów: ${skus}), model ${MODEL}, jakość ${QUALITY}`)

    if (dryRun) {
        jobs.slice(0, 10).forEach((job) => console.log(`  ${job.sku}/${job.index}  ${job.url}`))
        console.log('Dry-run: nic nie wysłano do OpenAI.')
        return
    }
    if (!process.env.OPENAI_API_KEY) {
        console.error('Brak OPENAI_API_KEY (dodaj do .env.local).')
        process.exit(1)
    }

    await mkdir(OUT_DIR, { recursive: true })
    const manifest = await readManifest()
    const results = await runPool(jobs, (job) => processJob(job, manifest))
    await buildReview(manifest)

    const count = (status) => results.filter((result) => result.status === status).length
    console.log(`Gotowe: nowe ${count('ok')}, z cache ${count('cache')}, błędy ${count('error')}.`)
    console.log(`Podgląd przed/po: ${path.join(OUT_DIR, 'index.html')}`)
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
