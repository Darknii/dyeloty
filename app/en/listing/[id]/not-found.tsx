import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8F6FB] px-5 py-12 text-[#1F1830]">
      <section className="mx-auto max-w-xl rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_18px_55px_rgba(51,36,82,0.10)]">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mt-3 text-[#6E6582]">This listing may have been removed or is no longer available.</p>
        <Link href="/en#listings" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white">
          Browse listings
        </Link>
      </section>
    </main>
  );
}
