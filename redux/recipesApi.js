import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const recipesApi = createApi({
  reducerPath: "recipesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "",
  }),
  endpoints: (builder) => ({
    generateRecipe: builder.mutation({
      query: ({ ingredients, language = "en" }) => ({
        url: "/api/recipe.php",
        method: "POST",
        body: { ingredients, language },
      }),
    }),
  }),
});

export const { useGenerateRecipeMutation } = recipesApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const recipesApi = createApi({
//   reducerPath: "recipesApi",
//   baseQuery: fetchBaseQuery({ baseUrl: "" }),
//   endpoints: (builder) => ({
//     generateRecipe: builder.query({
//       query: (ingredients) => ({
//         url: `/api/recipe.php?ingredients=${encodeURIComponent(
//           ingredients.join(",")
//         )}`,
//         method: "GET",
//       }),
//     }),
//   }),
// });

// export const { useLazyGenerateRecipeQuery } = recipesApi;
