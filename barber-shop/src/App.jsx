import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Admin from "./pages/Admin.jsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
