import { Routes, Route } from "react-router-dom"
import Home from "./views/Home/Home"
import Verify from "./views/Verify/Verify"

const App = ()=> (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/verify" element={<Verify />} />
  </Routes>
)

export default App
