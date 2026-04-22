import React from "react";
import { render, screen } from "@testing-library/react";
import SavedRecipes from "./SavedRecipes";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe("SavedRecipes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows empty message when there are no saved recipes", () => {
    render(<SavedRecipes />);

    expect(screen.getByText("Saved Recipes")).toBeInTheDocument();
    expect(screen.getByText("No saved recipes yet.")).toBeInTheDocument();
  });

  it("renders saved recipes from localStorage", () => {
    const mockRecipes = [
      "# Pancakes\n\nMix flour and eggs.",
      "# Pasta\n\nBoil water and cook pasta.",
    ];

    localStorage.setItem("savedRecipes", JSON.stringify(mockRecipes));

    render(<SavedRecipes />);

    expect(screen.getByText(/# Pancakes/)).toBeInTheDocument();
    expect(screen.getByText(/Mix flour and eggs\./)).toBeInTheDocument();
    expect(screen.getByText(/# Pasta/)).toBeInTheDocument();
    expect(screen.getByText(/Boil water and cook pasta\./)).toBeInTheDocument();
  });

  it("does not show empty message when recipes exist", () => {
    const mockRecipes = ["# Soup\n\nCook vegetables."];

    localStorage.setItem("savedRecipes", JSON.stringify(mockRecipes));

    render(<SavedRecipes />);

    expect(screen.queryByText("No saved recipes yet.")).not.toBeInTheDocument();
  });

  it("renders the correct number of recipes", () => {
    const mockRecipes = ["# One\n\nText", "# Two\n\nText", "# Three\n\nText"];

    localStorage.setItem("savedRecipes", JSON.stringify(mockRecipes));

    render(<SavedRecipes />);

    const recipeCards = screen.getAllByRole("article");

    expect(recipeCards).toHaveLength(3);
  });

  it("renders the correct number of recipe cards", () => {
    const mockRecipes = [
      "# One\n\nText one",
      "# Two\n\nText two",
      "# Three\n\nText three",
    ];

    localStorage.setItem("savedRecipes", JSON.stringify(mockRecipes));

    render(<SavedRecipes />);

    const recipeCards = document.querySelectorAll(".recipe-card");
    expect(recipeCards).toHaveLength(3);
  });

  it("renders the correct number of recipe cards", () => {
    const mockRecipes = [
      "#First\n\nRecipe",
      "#Second\n\nRecipe",
      "#Third\n\nRecipe",
    ];

    localStorage.setItem("savedRecipes", JSON.stringify(mockRecipes));

    render(<SavedRecipes />);

    const recipeCards = document.querySelectorAll(".recipe-card");
    expect(recipeCards).toHaveLength(3);
  });

  it("renders title, hides empty state, and shows 2 recipe cards when recipes exist", () => {
    const mockRecipes = ["#First\n\nRecipe", "#Second\n\nRecipe"];

    localStorage.setItem()
  });
});
