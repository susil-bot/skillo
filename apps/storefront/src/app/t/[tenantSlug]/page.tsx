import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedProducts } from "@/components/commerce/featured-products";
import { getTokenForTenantSlug } from "@/lib/tenant-config";
import { SITE_NAME, buildCanonicalUrl } from "@/lib/metadata";

type PageProps = { params: Promise<{ tenantSlug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params;
  const token = getTokenForTenantSlug(tenantSlug);
  const title = token === "__default_channel__" ? SITE_NAME : `${SITE_NAME} - ${tenantSlug}`;
  return {
    title: { absolute: title },
    description: `Shop at ${tenantSlug} tenant store.`,
    alternates: { canonical: buildCanonicalUrl(`/t/${tenantSlug}`) },
  };
}

export default async function TenantPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const token = getTokenForTenantSlug(tenantSlug);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-4">
        <p className="text-muted-foreground text-sm">
          Tenant: <span className="font-medium text-foreground">{tenantSlug}</span>
          {" · "}
          <Link href="/" className="underline hover:no-underline">
            All stores
          </Link>
        </p>
      </div>
      <HeroSection />
      <FeaturedProducts tenantToken={token} />
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>You are viewing the storefront for tenant &quot;{tenantSlug}&quot;.</p>
        </div>
      </section>
    </div>
  );
}
