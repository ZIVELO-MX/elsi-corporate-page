import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { buildBreadcrumbJsonLd, indexable } from "@/lib/seo";

type BreadcrumbItem = {
  label: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      {indexable ? (
        <StructuredData value={buildBreadcrumbJsonLd(items)} />
      ) : null}
      <nav className="breadcrumb" aria-label="Migas de pan">
        <ol>
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <li key={`${item.href}-${item.label}`}>
                {!current ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current={current ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
