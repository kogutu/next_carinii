import { NextRequest, NextResponse } from "next/server";
import { fetchProductReviews } from "@/lib/typesense";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sku = searchParams.get("sku");
  const productBasename = searchParams.get("base");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "12");

  if (!sku && !productBasename) {
    return NextResponse.json(
      { error: "SKU parameter is required" },
      { status: 400 }
    );
  }

  try {
    const reviews = await fetchProductReviews(sku, productBasename, page, perPage);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
