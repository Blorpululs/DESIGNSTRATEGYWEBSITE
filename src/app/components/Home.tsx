import { useState } from "react";
import { Link } from "react-router";
import bunnyIcon from "../../assets/images/Bunnyicon.png";
import duck2Icon from "../../assets/images/DUCK 2.png";
import locustIcon from "../../assets/images/HONEYLOCUSTlowquality.jpg";
import willowIcon from "../../assets/images/willowtree.jpg";
import mossIcon from "../../assets/images/Moss.png";
import turkeyIcon from "../../assets/images/Turkeyicon.png";

type DesktopItem = {
  label: string;
  path: string;
  icon: string;
};

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const items: DesktopItem[] = [
    { label: "Eastern Cottontail Rabbit", path: "/circle-push", icon: bunnyIcon },
    { label: "Mallard", path: "/water-physics", icon: duck2Icon },
    { label: "Honey Locust", path: "/honey-locust", icon: locustIcon },
    { label: "Weeping Willow Tree", path: "/willow-tree", icon: willowIcon },
    { label: "Joint Tooth Moss", path: "/joint-tooth-moss", icon: mossIcon },
    { label: "Wild Turkey", path: "/wild-turkey", icon: turkeyIcon },
  ];

  return (
    <div className="w-full min-h-full p-3 sm:p-5">
      <div
        className="win95-border-sunken relative overflow-hidden"
        style={{
          minHeight: "calc(100dvh - 150px)",
          background: "linear-gradient(180deg, #0a7e7e 0%, #056869 100%)",
          padding: "14px",
        }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1 content-start">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="w95-desktop-shortcut"
            >
              <div className="w95-desktop-shortcut-icon">
                <img
                  src={item.icon}
                  alt={item.label}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </div>
              <div className="w95-desktop-shortcut-label">{item.label}</div>
            </Link>
          ))}
        </div>

        {showWelcome && (
          <div
            className="win95-window"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 340px)",
              maxHeight: "calc(100dvh - 190px)",
              overflow: "auto",
            }}
          >
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">Welcome</div>
              <div className="win95-titlebar-controls">
                <button
                  type="button"
                  className="win95-control-button"
                  aria-label="Close welcome"
                  onClick={() => setShowWelcome(false)}
                >
                  x
                </button>
              </div>
            </div>
            <div className="win95-window-content flex flex-col gap-2">
              <p className="m-0">Welcome to my website! This site is based on the flora and fauna I saw on my walks throughout Boston in the span of one week.</p>
              <p className="m-0">Website was coded with assistance from OpenCode, and the ChatGPT-5.3 Codex model.</p>
              <p className="m-0">Double click an icon or click the navigation buttons at the top of the screen to open a simulation.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
