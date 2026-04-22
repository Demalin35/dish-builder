import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import SavedRecipes from "./components/SavedRecipes";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/saved" element={<SavedRecipes />} />
      </Routes>
    </BrowserRouter>
  );
}
