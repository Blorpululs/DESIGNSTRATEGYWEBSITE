import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import CirclePush from "./components/CirclePush";
import WaterPhysics from "./components/WaterPhysics";
import HoneyLocust from "./components/HoneyLocust";
import WillowTree from "./components/WillowTree";
import JointToothMoss from "./components/JointToothMoss";
import WildTurkey from "./components/WildTurkey";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "circle-push", Component: CirclePush },
      { path: "water-physics", Component: WaterPhysics },
      { path: "honey-locust", Component: HoneyLocust },
      { path: "willow-tree", Component: WillowTree },
      { path: "willow", Component: WillowTree },
      { path: "willowtree", Component: WillowTree },
      { path: "joint-tooth-moss", Component: JointToothMoss },
      { path: "wild-turkey", Component: WildTurkey },
      { path: "wildturkey", Component: WildTurkey },
      { path: "turkey", Component: WildTurkey },
      { path: "*", Component: NotFound },
    ],
  },
]);
