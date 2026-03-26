import { Link } from "react-router";
import Window from "./Window";

export default function NotFound() {
  return (
    <div className="win95-desktop">
      <Window>
        <div style={{ textAlign: "center" }}>
          <h1>404</h1>
          <p>Page not found</p>
          <Link to="/" className="win95-menubar-link">Go back home</Link>
        </div>
      </Window>
    </div>
  );
}
