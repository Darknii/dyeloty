export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <section className="mx-auto max-w-5xl px-6 py-20">

        <h1 className="text-5xl font-bold text-[#2D2D2D]">
          🧶 Dyeloty
        </h1>

        <p className="mt-6 text-xl text-gray-600">
          Find the perfect yarn match.
        </p>

        <p className="mt-2 text-gray-500">
          Never leave a project unfinished.
        </p>

        <div className="mt-10 flex flex-col gap-4 md:flex-row">

          <button className="rounded-2xl bg-[#8EA38C] px-8 py-4 text-white">
            Search Yarn
          </button>

          <button className="rounded-2xl border px-8 py-4">
            Add Listing
          </button>

          <button className="rounded-2xl border px-8 py-4">
            Looking For
          </button>

        </div>

      </section>
    </main>
  );
}