import { getDataTypesense } from "@/lib/typesense";
import BlogClient from "./blog-client";
import { JsonLd } from "@/components/json-ld";
import { buildBlogListJsonLd } from "@/lib/json-ld";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const PER_PAGE = 12;
const COLLECTION = "sobianek_postspages";
const FILTER = "category_names:=[`BLOG EKSPERTÓW`] && post_type:=[`post`]";
const FACET_BY = "author_name,category_names,tag_names";
const CACHE_TTL = 60; // seconds

/* ------------------------------------------------------------------ */
/*  Data fetching (cached on server)                                   */
/* ------------------------------------------------------------------ */

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    url: string;
    excerpt: string;
    content_text: string;
    image_main: string;
    image_medium: string;
    image_thumbnail: string;
    image_large: string;
    author_name: string;
    author_slug: string;
    category_names: string[];
    tag_names: string[];
    status: string;
    meta_title: string;
    meta_description: string;
    post_type: string;
    [key: string]: any;
}

export interface BlogPageData {
    posts: BlogPost[];
    totalFound: number;
    page: number;
    totalPages: number;
}

async function getBlogPosts(page: number): Promise<BlogPageData> {
    try {
        const response = await getDataTypesense({
            searches: [
                {
                    collection: COLLECTION,
                    q: "*",
                    query_by:
                        "title,excerpt,author_name,category_names,tag_names",
                    facet_by: FACET_BY,
                    filter_by: FILTER,
                    max_facet_values: 10,
                    page,
                    per_page: PER_PAGE,
                    sort_by: "pid:desc",
                    exclude_fields: "content_text",
                },
            ],
        });
        console.log(response);

        const hits = response.hits || [];

        return {
            posts: hits.map((hit: any) => hit.document as BlogPost),
            totalFound: response.found || 0,
            page,
            totalPages: Math.ceil((response.found || 0) / PER_PAGE),
        };
    } catch (error) {
        console.error("[BlogPage] fetch error:", error);
        return { posts: [], totalFound: 0, page: 1, totalPages: 0 };
    }
}

/* ------------------------------------------------------------------ */
/*  Server Component                                                   */
/* ------------------------------------------------------------------ */

interface BlogPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
    const data = await getBlogPosts(currentPage);

    return (
        <>
            <JsonLd data={buildBlogListJsonLd(data.posts)} />
            <BlogClient initialData={data} />
        </>
    );
}