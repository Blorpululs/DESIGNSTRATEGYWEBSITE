import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useOutlet } from "react-router";
import homeIcon from "../../assets/images/HomeIcon.png";

export default function Root() {
  const location = useLocation();
  const outlet = useOutlet();
  const transitionDurationMs = 170;
  const transitionTimerRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [debugMode, setDebugMode] = useState(() => {
    try {
      return window.localStorage.getItem("win95-debug-mode") === "1";
    } catch {
      return false;
    }
  });
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [currentOutlet, setCurrentOutlet] = useState(outlet);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [previousOutlet, setPreviousOutlet] = useState<ReturnType<typeof useOutlet> | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.body.classList.add("win95-theme");
    return () => {
      document.body.classList.remove("win95-theme");
      document.body.classList.remove("debug-on");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(mediaQuery.matches);
    apply();

    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (location.pathname === currentPath) {
      setCurrentOutlet(outlet);
      return;
    }

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (prefersReducedMotion) {
      setPreviousPath(null);
      setPreviousOutlet(null);
      setCurrentPath(location.pathname);
      setCurrentOutlet(outlet);
      setIsTransitioning(false);
      return;
    }

    setPreviousPath(currentPath);
    setPreviousOutlet(currentOutlet);
    setCurrentPath(location.pathname);
    setCurrentOutlet(outlet);
    setIsTransitioning(true);

    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousPath(null);
      setPreviousOutlet(null);
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, transitionDurationMs);
  }, [location.pathname, currentPath, currentOutlet, outlet, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("debug-on", debugMode);
    try {
      window.localStorage.setItem("win95-debug-mode", debugMode ? "1" : "0");
    } catch {
      // no-op
    }
  }, [debugMode]);

  const pageLabelMap: Record<string, string> = {
    "/": "Home",
    "/circle-push": "Eastern Cottontail Rabbit",
    "/water-physics": "Mallard",
    "/honey-locust": "Honey Locust",
    "/willow-tree": "Weeping Willow Tree",
    "/joint-tooth-moss": "Joint Tooth Moss",
    "/wild-turkey": "Wild Turkey",
  };
  const pageLabel = pageLabelMap[location.pathname]
    ?? location.pathname.replace("/", "").replace("-", " ");

  const isActivePath = (paths: string[]) => paths.includes(location.pathname);
  const navItems = [
    { label: "Home", to: "/", paths: ["/"] },
    { label: "Eastern Cottontail Rabbit", to: "/circle-push", paths: ["/circle-push"] },
    { label: "Mallard", to: "/water-physics", paths: ["/water-physics"] },
    { label: "Honey Locust", to: "/honey-locust", paths: ["/honey-locust"] },
    { label: "Weeping Willow Tree", to: "/willow-tree", paths: ["/willow-tree"] },
    { label: "Joint Tooth Moss", to: "/joint-tooth-moss", paths: ["/joint-tooth-moss"] },
    { label: "Wild Turkey", to: "/wild-turkey", paths: ["/wild-turkey", "/wildturkey", "/turkey"] },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Navigation */}
      <nav className="win95-menubar">
        <div className="flex items-center gap-3 flex-wrap">
          {navItems.map((item) => {
            const active = isActivePath(item.paths);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`win95-menubar-link${item.to === "/" ? " win95-menubar-link-home" : ""}${active ? " win95-menubar-link-active" : ""}`}
              >
                {item.to === "/" ? (
                  <img src={homeIcon} alt="Home" className="win95-menubar-home-icon" draggable={false} />
                ) : (
                  <span className="win95-menubar-link-label">{item.label}</span>
                )}
                {active && <span className="win95-menubar-caret">^</span>}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Page content */}
      <div className="flex-1 min-h-0 overflow-auto pb-[28px]">
        <div className="route-transition-wrap">
          {previousOutlet && (
            <div key={`exit-${previousPath}`} className="route-layer route-layer-exit" aria-hidden="true">
              {previousOutlet}
            </div>
          )}
          <div key={`enter-${currentPath}`} className={`route-layer ${isTransitioning ? "route-layer-enter" : ""}`}>
            {currentOutlet}
          </div>
        </div>
      </div>

      <div className="win95-taskbar">
        <button
          type="button"
          className="win95-button"
          onClick={() => setDebugMode((v) => !v)}
        >
          Dev Menu: {debugMode ? "On" : "Off"}
        </button>
        <div className="win95-taskbar-tab">{pageLabel}</div>
      </div>
    </div>
  );
}
