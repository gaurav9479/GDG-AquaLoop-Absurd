import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 bg-blue-600 text-white">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/scanner">Scanner</Link>
      <Link to="/trends">Trends</Link>
      <Link to="/predict">Predict</Link>
    </nav>
  );
}
