import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="text-sm text-zinc-500">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">/</span>}
          {item.href ? (
            <Link href={item.href} className="text-amber-600 hover:text-amber-700">
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </span>
      ))}
    </nav>
  );
}
