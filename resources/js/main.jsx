import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import LoginPage from "./pages/Login/LoginPage"
import RegisterPage from "./pages/Register/RegisterPage"
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute"
import ChatsPage from "./pages/Chats/ChatsPage"

export default function Main() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<ChatsPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    )
}