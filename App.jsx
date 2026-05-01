import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import SavedRecipes from "./components/SavedRecipes";
import Account from "./components/Account";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="bottom-scroll-fade" aria-hidden="true" />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/saved-recipes" element={<SavedRecipes />} />
        </Route>

        <Route path="/saved" element={<Navigate to="/saved-recipes" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
