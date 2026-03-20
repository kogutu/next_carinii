import { AnyMxRecord } from "dns";

export interface Product {
  name: string;
  image_medium: string;
  save_percent: number;
  promo_code: string;
  price: number;
  brutto_pln: number;
  sku: string;
  url: string;
  manufacturer?: string;
  id: string;
  hide_price: boolean;
  has_special_price: boolean;
  slug: string;
  final_price_netto_pln: number;
  image_main: string,
  categories: any,
  new: string,
  size_qty: any,
  shortdesc: string,
  image_thumbnail: string,
  image_small: string,
  final_price: number; special_price: number;
}

export interface ApiResponse {
  found: number;
  out_of: number;
  page: number;
  hits: Array<{
    document: Product;
  }>;
}

const API_BASE = 'https://sklep.carinii.com.pl/directseo/nextjs/api/?path=collections/carinii_prs/documents/search';

export async function fetchProducts(
  categoryId: string,
  page: number = 1,
  perPage: number = 12,
  sortBy: string = 'createdat:desc'
): Promise<ApiResponse> {
  const params = new URLSearchParams({
    q: '*',
    page: page.toString(),
    per_page: perPage.toString(),
    filter_by: `cids:${categoryId}`,
    sort_by: sortBy,
  });


  console.log(`${API_BASE}?${params}`)
  const response = await fetch(`${API_BASE}?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-typesense-api-key': 'xyz'
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function searchProducts(
  term: string,
  page: number = 1,
  perPage: number = 12,
  sortBy: string = 'createdat:desc'
): Promise<ApiResponse> {
  console.log(term)
  const params = new URLSearchParams({
    q: term,
    query_by: "name,description,sku",
    page: page.toString(),
    per_page: perPage.toString(),
    sort_by: sortBy,
  });


  console.log(`${API_BASE}?${params}`)
  const response = await fetch(`${API_BASE}?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-typesense-api-key': 'xyz'
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}