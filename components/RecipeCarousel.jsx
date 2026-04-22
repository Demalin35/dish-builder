import { useMemo, useState } from "react";
import "../styles/RecipeCarousel.css";
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

  const prev = () => setIndex((i) => (i - 1 + recipes.length) % recipes.length);
  const next = () => setIndex((i) => (i + 1) % recipes.length);

  return (
    <section className="empty-state" aria-label="Recipe suggestions">
      <h2 className="empty-title">Need inspiration?</h2>
      <p className="empty-subtitle">
        Add ingredients above, or start from a popular recipe:
      </p>

      <div className="carousel" role="region" aria-roledescription="carousel">
        <button
          type="button"
          className="carousel-nav"
          onClick={prev}
          aria-label="Previous recipe"
        >
          ‹
        </button>

        <div className="carousel-viewport">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {recipes.map((r) => (
              <article key={r.title} className="carousel-slide">
                <div className="slide-content">
                  <h3 className="slide-title">{r.title}</h3>
                  <p className="slide-desc">{r.description}</p>

                  <div className="slide-ingredients">
                    {r.ingredients.slice(0, 6).map((ing) => (
                      <span key={ing} className="pill">
                        {ing}
                      </span>
                    ))}
                  </div>

                  {onQuickAdd && (
                    <button
                      type="button"
                      className="slide-cta"
                      onClick={() => onQuickAdd(r.ingredients)}
                    >
                      Use these ingredients
                    </button>
                  )}
                </div>

                <img src={r.image} alt={r.title} className="slide-image" />
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="carousel-nav"
          onClick={next}
          aria-label="Next recipe"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots" aria-label="Carousel pagination">
        {recipes.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : "false"}
          />
        ))}
      </div>
    </section>
  );
}
