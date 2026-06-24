import Header from "./Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2D2D2D]">
      <section className="mx-auto max-w-6xl px-6 py-20">

        <Header />

        <div className="mt-20">

          <h1 className="text-6xl font-bold">
            Find your missing skein.
          </h1>

          <p className="mt-6 text-2xl text-gray-600">
            Never leave a project unfinished.
          </p>

          <div className="mt-10 flex flex-col gap-4 md:flex-row">

            <button className="rounded-2xl bg-[#90A885] px-8 py-4 font-medium text-white shadow">
              🔍 Search Yarn
            </button>

            <button className="rounded-2xl border border-gray-300 px-8 py-4 font-medium">
              ➕ Add Listing
            </button>

            <button className="rounded-2xl border border-gray-300 px-8 py-4 font-medium">
              🧶 Looking For
            </button>

          </div>

        </div>

        <section className="mt-32">

          <h2 className="mb-12 text-3xl font-semibold">
            How it works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">
                🔍 Search
              </h3>

              <p className="mt-4 text-gray-500">
                Find the yarn you're missing.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">
                💬 Contact
              </h3>

              <p className="mt-4 text-gray-500">
                Contact the owner through Vinted, OLX or email.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">
                ❤️ Finish
              </h3>

              <p className="mt-4 text-gray-500">
                Complete your project.
              </p>
            </div>

          </div>

        </section>

        <section className="mt-32">

          <div className="grid gap-8 text-center md:grid-cols-3">

            <div>
              <div className="text-5xl font-bold text-[#90A885]">
                ❤️ 0
              </div>

              <p className="mt-2 text-gray-500">
                Skeins found
              </p>
            </div>

            <div>
              <div className="text-5xl font-bold text-[#90A885]">
                🧶 0
              </div>

              <p className="mt-2 text-gray-500">
                Active listings
              </p>
            </div>

            <div>
              <div className="text-5xl font-bold text-[#90A885]">
                🌍 1
              </div>

              <p className="mt-2 text-gray-500">
                Country
              </p>
            </div>

          </div>

        </section>

        <section className="mt-32">

          <h2 className="mb-8 text-3xl font-semibold">
            Recently Added
          </h2>

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Drops Air</h3>
              <p className="mt-2 text-gray-500">Color 17</p>
              <p className="text-gray-500">3 skeins available</p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Sandnes Sunday</h3>
              <p className="mt-2 text-gray-500">Color 1015</p>
              <p className="text-gray-500">2 skeins available</p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Merino Gold</h3>
              <p className="mt-2 text-gray-500">Color 214</p>
              <p className="text-gray-500">5 skeins available</p>
            </div>

          </div>

        </section>

        <section className="mt-32 text-center">

          <h2 className="text-3xl font-semibold">
            Why Dyeloty?
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg text-gray-500">
            Have you ever spent weeks searching for a missing skein?
          </p>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-500">
            So did we.
          </p>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-500">
            Dyeloty was created to help knitters and crocheters find the yarn they need to finally finish their projects.
          </p>

        </section>

      </section>

      <footer className="mt-24 border-t py-8 text-center text-sm text-gray-500">
        Dyeloty © 2026
      </footer>

    </main>
  );
}