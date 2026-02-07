import {ProductCarousel} from "@/components/commerce/product-carousel";
import {cacheLife} from "next/cache";
import {query} from "@/lib/vendure/api";
import {GetCollectionProductsQuery} from "@/lib/vendure/queries";

async function getFeaturedCollectionProducts(tenantToken?: string) {
    'use cache'
    cacheLife('days')

    const result = await query(
        GetCollectionProductsQuery,
        {
            slug: "electronics",
            input: {
                collectionSlug: "electronics",
                take: 12,
                skip: 0,
                groupByProduct: true
            }
        },
        tenantToken ? { tenantToken } : undefined
    );

    return result.data.search.items;
}

export async function FeaturedProducts(props: { tenantToken?: string }) {
    const products = await getFeaturedCollectionProducts(props.tenantToken);

    return (
        <ProductCarousel
            title="Featured Products"
            products={products}
        />
    );
}