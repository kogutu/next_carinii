import { NextResponse } from "next/server"
import { getPopularitySkus } from "@/lib/popularity"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    if (!/^\d+$/.test(id)) {
        return NextResponse.json({ error: "Invalid category id" }, { status: 400 })
    }

    const skus = await getPopularitySkus(id)
    return NextResponse.json(skus, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    })
}
