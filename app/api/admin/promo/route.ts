import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { isAdminRequest } from '@/lib/adminAuth'
import { loadPromoConfig, savePromoConfig } from '@/lib/siteSettings'

const CATS_TREE_URL = 'https://sklep.carinii.com.pl/directseo/nextjs/typesense/categories/cats_tree.json?t=2'

type TreeNode = { id: string | number; name: string; children?: TreeNode[] }

export type AdminCategory = { id: string; name: string; path: string; depth: number }

// Drzewo kategorii -> płaska lista z pełną ścieżką („Obuwie › Kozaki › Na szpilce”) do wielokrotnego wyboru
const flattenCategories = (nodes: TreeNode[], trail: string[] = [], depth = 0, seen = new Set<string>()): AdminCategory[] => {
    const result: AdminCategory[] = []
    for (const node of nodes) {
        const id = String(node.id)
        const name = String(node.name).trim()
        const path = [...trail, name]
        if (!seen.has(id)) {
            seen.add(id)
            result.push({ id, name, path: path.join(' › '), depth })
        }
        if (node.children?.length) result.push(...flattenCategories(node.children, path, depth + 1, seen))
    }
    return result
}

const loadCategories = async (): Promise<AdminCategory[]> => {
    try {
        const response = await fetch(CATS_TREE_URL, { next: { revalidate: 3600 } })
        if (!response.ok) return []
        const tree = await response.json()
        return Array.isArray(tree) ? flattenCategories(tree) : []
    } catch {
        return []
    }
}

const unauthorized = () => NextResponse.json({ success: false, message: 'Zaloguj się do panelu.' }, { status: 401 })

// Bieżąca konfiguracja (prosto z bazy) + lista kategorii do wyboru
export async function GET(request: NextRequest) {
    if (!isAdminRequest(request)) return unauthorized()

    const [config, categories] = await Promise.all([loadPromoConfig(), loadCategories()])
    return NextResponse.json({ success: true, config, categories })
}

// Zapis konfiguracji: walidacja po stronie serwera, potem odświeżenie stron
export async function PUT(request: NextRequest) {
    if (!isAdminRequest(request)) return unauthorized()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe dane.' }, { status: 400 })
    }

    try {
        const config = await savePromoConfig(body)
        // dane z unstable_cache (tag „promo”) wygasają od razu, a strony statyczne i ISR są renderowane od nowa
        revalidateTag('promo', { expire: 0 })
        revalidatePath('/', 'layout')
        return NextResponse.json({ success: true, config })
    } catch (error) {
        console.error('[admin] zapis promocji nie powiódł się:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się zapisać (baza danych). Spróbuj ponownie.' }, { status: 500 })
    }
}
