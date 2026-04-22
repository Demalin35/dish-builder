import { useEffect, useMemo, useState } from "react";
import bananaPancakes from "../images/banana_pancakes.jpg";
import omelette from "../images/Omelette.png";
import garlicPasta from "../images/garlic-pasta.jpg";
import avocadoToast from "../images/avocado-toast.avif";

export default function RecipeCarousel({ onQuickAdd }) {
  const recipes = useMemo(
    () => [
      {
        title: "Banana Pancakes",
        description: "Fluffy + quick breakfast.",
        ingredients: ["egg", "flour", "milk", "banana"],
        image: bananaPancakes,
      },
      {
        title: "Omelette",
        description: "Classic + flexible.",
        ingredients: ["egg", "milk", "cheese", "butter"],
        image: omelette,
      },
      {
        title: "Garlic Pasta",
        description: "5-min comfort food.",
        ingredients: ["pasta", "garlic", "olive oil", "parmesan"],
        image: garlicPasta,
      },
      {
        title: "Avocado Toast",
        description: "Simple + satisfying.",
        ingredients: ["bread", "avocado", "salt", "lemon"],
        image: avocadoToast,
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prev = () => setIndex((i) => (i - 1 + recipes.length) % recipes.length);
  const next = () => setIndex((i) => (i + 1) % recipes.length);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % recipes.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, recipes.length]);

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl" aria-label="Recipe suggestions">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        Featured inspiration
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-800 sm:text-4xl">
        Need inspiration?
      </h2>
      <p className="mt-2 max-w-xl text-sm text-stone-600 sm:text-base">
        Add ingredients above, or start from a popular recipe:
      </p>

      <div
        className="mt-6 flex items-center gap-3"
        role="region"
        aria-roledescription="carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button
          type="button"
          className="btn btn-secondary hidden h-11 w-11 rounded-full p-0 text-2xl leading-none sm:inline-flex"
          onClick={prev}
          aria-label="Previous recipe"
        >
          ‹
        </button>

        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft-lg)] ring-1 ring-stone-200/70">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {recipes.map((r) => (
              <article
                key={r.title}
                className="grid min-w-full gap-5 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
              >
                <div className="order-2 min-w-0 lg:order-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Recipe pick
                  </p>
                  <h3 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-base text-stone-600 sm:text-lg">{r.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {r.ingredients.slice(0, 6).map((ing) => (
                      <span
                        key={ing}
                        className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-700"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  {onQuickAdd && (
                    <button
                      type="button"
                      className="btn btn-primary btn-md mt-6 w-full rounded-xl px-5 sm:w-auto"
                      onClick={() => onQuickAdd(r.ingredients)}
                    >
                      Use these ingredients
                    </button>
                  )}
                </div>

                <img
                  src={r.image}
                  alt={r.title}
                  className="order-1 h-56 w-full rounded-2xl object-cover shadow-[var(--shadow-soft)] sm:h-64 lg:order-2 lg:h-80"
                />
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary hidden h-11 w-11 rounded-full p-0 text-2xl leading-none sm:inline-flex"
          onClick={next}
          aria-label="Next recipe"
        >
          ›
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2" aria-label="Carousel pagination">
        {recipes.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`h-2.5 rounded-full border transition ${
              i === index
                ? "w-7 border-brand-400 bg-brand-500"
                : "w-2.5 border-stone-300 bg-white hover:border-brand-300"
            }`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : "false"}
          />
        ))}
      </div>
    </section>
  );
}
