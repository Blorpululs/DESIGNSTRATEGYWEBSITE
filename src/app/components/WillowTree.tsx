import { useEffect, useRef, useState } from "react";
import Window from "./Window";
import willowBranchImage from "../../assets/images/willowbranch2.png";
import willowTreeImage from "../../assets/images/willowtree.jpg";
import loadingGif from "../../assets/images/loading.gif";

type SimPoint = {
  x: number;
  y: number;
  oldx: number;
  oldy: number;
  pinned: boolean;
};

type BranchConfig = {
  anchorXRatio: number;
  anchorYRatio: number;
  lengthRatio: number;
  thickness: number;
};

type SimBranch = {
  points: SimPoint[];
  segLength: number;
  thickness: number;
};

const MAX_BRANCHES = 32;

const APPLIED_LAYOUT = {
  branchCount: 17,
  blendStrength: 0,
  branchOpacity: 0.55,
  windEnabled: true,
  branches: [
    { anchorXRatio: 0.6302798671576813, anchorYRatio: 0.1494278877965019, lengthRatio: 0.85, thickness: 15 },
    { anchorXRatio: 0.45165391295920804, anchorYRatio: 0.42309116737454816, lengthRatio: 0.4, thickness: 17 },
    { anchorXRatio: 0.8974554396767652, anchorYRatio: 0.4325278321875843, lengthRatio: 0.445, thickness: 17 },
    { anchorXRatio: 0.6760813938752386, anchorYRatio: 0.15571897367317966, lengthRatio: 0.85, thickness: 18 },
    { anchorXRatio: 0.7417302488370706, anchorYRatio: 0.1604373060796977, lengthRatio: 0.85, thickness: 18 },
    { anchorXRatio: 0.8592875007454676, anchorYRatio: 0.3664711784963317, lengthRatio: 0.5, thickness: 18 },
    { anchorXRatio: 0.8272264320431775, anchorYRatio: 0.3027736910083382, lengthRatio: 0.565, thickness: 17 },
    { anchorXRatio: 0.5783714702111165, anchorYRatio: 0.21076620908123642, lengthRatio: 0.72, thickness: 16 },
    { anchorXRatio: 0.5264630732645516, anchorYRatio: 0.39478117293543996, lengthRatio: 0.38, thickness: 15 },
    { anchorXRatio: 0.7111958976920324, anchorYRatio: 0.1604373060796977, lengthRatio: 0.73, thickness: 15 },
    { anchorXRatio: 0.4898218518905057, anchorYRatio: 0.4136545025615121, lengthRatio: 0.475, thickness: 15 },
    { anchorXRatio: 0.4272264320431775, anchorYRatio: 0.4372461645941023, lengthRatio: 0.26, thickness: 15 },
    { anchorXRatio: 0.3966920808981393, anchorYRatio: 0.4514011618136564, lengthRatio: 0.375, thickness: 15 },
    { anchorXRatio: 0.37226459998210876, anchorYRatio: 0.47027449143972855, lengthRatio: 0.325, thickness: 15 },
    { anchorXRatio: 0.7966920808981394, anchorYRatio: 0.2555903669431578, lengthRatio: 0.36, thickness: 15 },
    { anchorXRatio: 0.767684447310353, anchorYRatio: 0.20604787667471838, lengthRatio: 0.3951162579629031, thickness: 15.585270966048386 },
    { anchorXRatio: 0.34478368395157444, anchorYRatio: 0.48914782106580074, lengthRatio: 0.31, thickness: 15 },
  ] as BranchConfig[],
};

const makeDefaultBranchConfig = (index: number, total: number): BranchConfig => {
  if (total <= 1) {
    return { anchorXRatio: 0.5, anchorYRatio: 0.22, lengthRatio: 0.46, thickness: 17 };
  }
  const t = index / (total - 1);
  const eased = Math.sin(t * Math.PI);
  return {
    anchorXRatio: 0.16 + t * 0.64,
    anchorYRatio: 0.2 + (1 - eased) * 0.04,
    lengthRatio: 0.36 + eased * 0.18,
    thickness: 15 + eased * 3,
  };
};

const DEFAULT_BRANCH_CONFIGS: BranchConfig[] = APPLIED_LAYOUT.branches;

export default function WillowTree() {
  const referenceImageWidth = 700;
  const referenceImageHeight = 453;
  const maxContainerWidth = 800;
  const maxContainerHeight = 600;
  const contentPadding = 12;
  const headerPanelHeight = 56;

  const [containerSize, setContainerSize] = useState({ width: maxContainerWidth, height: maxContainerHeight });
  const [designMode, setDesignMode] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [copyNotice, setCopyNotice] = useState("");
  const [branchImageReady, setBranchImageReady] = useState(false);
  const [treeImageReady, setTreeImageReady] = useState(false);
  const [branchCount, setBranchCount] = useState(APPLIED_LAYOUT.branchCount);
  const [blendStrength, setBlendStrength] = useState(APPLIED_LAYOUT.blendStrength);
  const [branchOpacity, setBranchOpacity] = useState(APPLIED_LAYOUT.branchOpacity);
  const [windEnabled, setWindEnabled] = useState(APPLIED_LAYOUT.windEnabled);
  const [branchConfigs, setBranchConfigs] = useState<BranchConfig[]>(APPLIED_LAYOUT.branches);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const branchConfigsRef = useRef<BranchConfig[]>(branchConfigs);

  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  const contentWidth = containerWidth + contentPadding * 2;

  useEffect(() => {
    let cancelled = false;

    const branchLoader = new Image();
    branchLoader.onload = () => {
      if (!cancelled) setBranchImageReady(true);
    };
    branchLoader.onerror = () => {
      if (!cancelled) setBranchImageReady(true);
    };
    branchLoader.src = willowBranchImage;

    const treeLoader = new Image();
    treeLoader.onload = () => {
      if (!cancelled) setTreeImageReady(true);
    };
    treeLoader.onerror = () => {
      if (!cancelled) setTreeImageReady(true);
    };
    treeLoader.src = willowTreeImage;

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    branchConfigsRef.current = branchConfigs;
  }, [branchConfigs]);

  useEffect(() => {
    setBranchConfigs((prev) => {
      if (prev.length >= branchCount) return prev;
      const next = [...prev];
      for (let i = prev.length; i < branchCount; i += 1) {
        next.push(makeDefaultBranchConfig(i, branchCount));
      }
      return next;
    });
  }, [branchCount]);

  useEffect(() => {
    if (selectedBranch >= branchCount) {
      setSelectedBranch(Math.max(0, branchCount - 1));
    }
  }, [selectedBranch, branchCount]);

  useEffect(() => {
    const updateSize = () => {
      const horizontalGutter = 24 + contentPadding * 2;
      const verticalGutter = 220 + contentPadding * 2 + headerPanelHeight + 16;
      const maxWidth = Math.max(280, Math.min(maxContainerWidth, window.innerWidth - horizontalGutter));
      const maxHeight = Math.max(210, Math.min(maxContainerHeight, window.innerHeight - verticalGutter));
      const fromWidthHeight = maxWidth * (referenceImageHeight / referenceImageWidth);

      if (fromWidthHeight <= maxHeight) {
        setContainerSize({ width: Math.round(maxWidth), height: Math.round(fromWidthHeight) });
        return;
      }

      const widthFromHeight = maxHeight * (referenceImageWidth / referenceImageHeight);
      setContainerSize({ width: Math.round(widthFromHeight), height: Math.round(maxHeight) });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(containerWidth * dpr);
    canvas.height = Math.round(containerHeight * dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const mouse = {
      x: -9999,
      y: -9999,
      px: -9999,
      py: -9999,
      vx: 0,
      vy: 0,
      active: false,
    };

    const createPoint = (x: number, y: number, pinned = false): SimPoint => ({
      x,
      y,
      oldx: x,
      oldy: y,
      pinned,
    });

    const createBranch = (segments: number): SimBranch => {
      const points: SimPoint[] = [];
      for (let i = 0; i <= segments; i += 1) {
        points.push(createPoint(containerWidth * 0.5, 12 + i * 10, i === 0));
      }
      return { points, segLength: 10, thickness: 16 };
    };

    const branches: SimBranch[] = branchConfigsRef.current.slice(0, branchCount).map(() => createBranch(10));
    const draggingBranch = { index: -1 };

    const getContainRect = (imgW: number, imgH: number, boxW: number, boxH: number) => {
      const scale = Math.min(boxW / imgW, boxH / imgH);
      const width = imgW * scale;
      const height = imgH * scale;
      const x = (boxW - width) / 2;
      const y = (boxH - height) / 2;
      return { x, y, width, height };
    };

    let treeDrawRect = {
      x: 0,
      y: 0,
      width: containerWidth,
      height: containerHeight,
    };

    const applyConfigToBranch = (branch: SimBranch, config: BranchConfig, reseed = false) => {
      const anchorX = treeDrawRect.x + treeDrawRect.width * config.anchorXRatio;
      const anchorY = treeDrawRect.y + treeDrawRect.height * config.anchorYRatio;
      const segments = branch.points.length - 1;
      const targetSegLength = (treeDrawRect.height * config.lengthRatio) / segments;

      branch.segLength = targetSegLength;
      branch.thickness = config.thickness;
      branch.points[0].x = anchorX;
      branch.points[0].y = anchorY;
      branch.points[0].oldx = anchorX;
      branch.points[0].oldy = anchorY;

      if (reseed) {
        for (let i = 1; i < branch.points.length; i += 1) {
          const p = branch.points[i];
          const jitter = (Math.random() - 0.5) * 2;
          p.x = anchorX + jitter;
          p.y = anchorY + i * targetSegLength;
          p.oldx = p.x;
          p.oldy = p.y;
        }
      }
    };

    const resetBranches = () => {
      const configs = branchConfigsRef.current;
      for (let i = 0; i < branches.length; i += 1) {
        applyConfigToBranch(branches[i], configs[i] ?? makeDefaultBranchConfig(i, branches.length), true);
      }
    };

    resetBranches();

    const constrain = (p1: SimPoint, p2: SimPoint, length: number) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!dist) return;

      const diff = (dist - length) / dist;
      const offsetX = dx * 0.5 * diff;
      const offsetY = dy * 0.5 * diff;

      if (!p1.pinned) {
        p1.x += offsetX;
        p1.y += offsetY;
      }
      if (!p2.pinned) {
        p2.x -= offsetX;
        p2.y -= offsetY;
      }
    };

    const distancePointToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const segLenSq = dx * dx + dy * dy;
      if (segLenSq === 0) {
        const ox = px - x1;
        const oy = py - y1;
        return Math.sqrt(ox * ox + oy * oy);
      }

      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / segLenSq));
      const nx = x1 + t * dx;
      const ny = y1 + t * dy;
      const ox = px - nx;
      const oy = py - ny;
      return Math.sqrt(ox * ox + oy * oy);
    };

    const applyMouse = (point: SimPoint) => {
      if (!mouse.active || point.pinned) return;

      const hitRadius = 24;
      const sweepDistance = distancePointToSegment(point.x, point.y, mouse.px, mouse.py, mouse.x, mouse.y);
      const directDx = point.x - mouse.x;
      const directDy = point.y - mouse.y;
      const directDistance = Math.sqrt(directDx * directDx + directDy * directDy);
      const inside = sweepDistance <= hitRadius || directDistance <= hitRadius;

      if (inside) {
        const maxPush = 12;
        const pushX = Math.max(-maxPush, Math.min(maxPush, mouse.vx * 0.5));
        const pushY = Math.max(-maxPush, Math.min(maxPush, mouse.vy * 0.5));
        point.x += pushX;
        point.y += pushY;
      }
    };

    const branchImage = new Image();
    let branchImageReady = false;
    branchImage.onload = () => {
      branchImageReady = true;
    };
    branchImage.src = willowBranchImage;

    const treeImage = new Image();
    let treeImageReady = false;
    treeImage.onload = () => {
      treeImageReady = true;
      treeDrawRect = getContainRect(treeImage.width, treeImage.height, containerWidth, containerHeight);
      resetBranches();
    };
    treeImage.src = willowTreeImage;

    const drawLineBranch = (branch: SimBranch) => {
      const pts = branch.points;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i += 1) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }
      ctx.strokeStyle = "#436d50";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawImageBranch = (branch: SimBranch) => {
      if (!branchImageReady) {
        drawLineBranch(branch);
        return;
      }

      const pts = branch.points;
      const slices = pts.length - 1;
      const topTrimRatio = 0.1;
      const sourceTop = branchImage.height * topTrimRatio;
      const sourceHeight = branchImage.height - sourceTop;
      const sliceHeight = sourceHeight / slices;

      for (let i = 1; i < slices; i += 1) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        ctx.save();
        ctx.translate(p1.x, p1.y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.globalAlpha = branchOpacity;
        ctx.drawImage(
          branchImage,
          0,
          sourceTop + i * sliceHeight,
          branchImage.width,
          sliceHeight,
          -branch.thickness / 2,
          0,
          branch.thickness,
          length + 1,
        );

        if (blendStrength > 0) {
          ctx.globalCompositeOperation = "multiply";
          ctx.globalAlpha = (0.1 + blendStrength * 0.32) * branchOpacity;
          ctx.fillStyle = "#5d6546";
          ctx.fillRect(-branch.thickness / 2, 0, branch.thickness, length + 1);
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
    };

    const drawDesignHandles = () => {
      if (!designMode) return;

      for (let i = 0; i < branches.length; i += 1) {
        const root = branches[i].points[0];
        ctx.beginPath();
        ctx.arc(root.x, root.y, i === selectedBranch ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === selectedBranch ? "#ffcc00" : "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#10131f";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    let rafId = 0;
    const targetFrameMs = 1000 / 30;
    let lastStepTime = 0;

    const animate = (now: number) => {
      if (lastStepTime === 0) {
        lastStepTime = now;
      }
      const elapsed = now - lastStepTime;
      if (elapsed < targetFrameMs) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      lastStepTime = now - (elapsed % targetFrameMs);

      ctx.clearRect(0, 0, containerWidth, containerHeight);
      if (treeImageReady) {
        ctx.drawImage(treeImage, treeDrawRect.x, treeDrawRect.y, treeDrawRect.width, treeDrawRect.height);
      } else {
        ctx.fillStyle = "#b7ccb0";
        ctx.fillRect(0, 0, containerWidth, containerHeight);
      }

      const configs = branchConfigsRef.current;
      for (let i = 0; i < branches.length; i += 1) {
        const branch = branches[i];
        const cfg = configs[i] ?? makeDefaultBranchConfig(i, branches.length);
        applyConfigToBranch(branch, cfg, false);

        for (const point of branch.points) {
          if (!point.pinned) {
            const vx = (point.x - point.oldx) * 0.985;
            const vy = (point.y - point.oldy) * 0.985;
            point.oldx = point.x;
            point.oldy = point.y;
            point.x += vx;
            point.y += vy + 0.2;
            if (windEnabled) {
              point.x += Math.sin(now * 0.001 + point.y * 0.025) * 0.09;
            }
          }
          if (!designMode || draggingBranch.index < 0) {
            applyMouse(point);
          }
        }

        const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        const constraintIterations = mouseSpeed > 14 ? 8 : mouseSpeed > 8 ? 6 : 4;
        for (let step = 0; step < constraintIterations; step += 1) {
          for (let j = 0; j < branch.points.length - 1; j += 1) {
            constrain(branch.points[j], branch.points[j + 1], branch.segLength);
          }
        }

        drawImageBranch(branch);
      }

      drawDesignHandles();
      rafId = requestAnimationFrame(animate);
    };

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const next = getMousePos(e);
      if (!mouse.active) {
        mouse.px = next.x;
        mouse.py = next.y;
      } else {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
      mouse.vx = next.x - mouse.x;
      mouse.vy = next.y - mouse.y;
      mouse.x = next.x;
      mouse.y = next.y;
      mouse.active = true;

      if (designMode && draggingBranch.index >= 0) {
        const index = draggingBranch.index;
        const nx = clamp((next.x - treeDrawRect.x) / Math.max(1, treeDrawRect.width), 0, 1);
        const ny = clamp((next.y - treeDrawRect.y) / Math.max(1, treeDrawRect.height), 0, 1);
        setBranchConfigs((prev) => {
          const nextConfigs = [...prev];
          const base = nextConfigs[index] ?? makeDefaultBranchConfig(index, branchCount);
          nextConfigs[index] = { ...base, anchorXRatio: nx, anchorYRatio: ny };
          branchConfigsRef.current = nextConfigs;
          return nextConfigs;
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!designMode) return;

      const pos = getMousePos(e);
      let nearestIndex = -1;
      let nearestDistance = Infinity;
      for (let i = 0; i < branches.length; i += 1) {
        const p = branches[i].points[0];
        const dx = p.x - pos.x;
        const dy = p.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIndex = i;
        }
      }

      if (nearestIndex >= 0 && nearestDistance <= 18) {
        draggingBranch.index = nearestIndex;
        setSelectedBranch(nearestIndex);
      }
    };

    const stopDrag = () => {
      draggingBranch.index = -1;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!designMode) return;
      e.preventDefault();
      const index = Math.min(selectedBranch, branchCount - 1);
      const delta = e.deltaY < 0 ? 0.02 : -0.02;
      setBranchConfigs((prev) => {
        const nextConfigs = [...prev];
        const cfg = nextConfigs[index] ?? makeDefaultBranchConfig(index, branchCount);
        nextConfigs[index] = {
          ...cfg,
          lengthRatio: clamp(cfg.lengthRatio + delta, 0.18, 0.85),
        };
        branchConfigsRef.current = nextConfigs;
        return nextConfigs;
      });
    };

    const handleMouseLeave = () => {
      stopDrag();
      mouse.active = false;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.px = -9999;
      mouse.py = -9999;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", stopDrag);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", stopDrag);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [containerWidth, containerHeight, designMode, selectedBranch, branchCount, blendStrength, branchOpacity, windEnabled]);

  const selected = branchConfigs[selectedBranch] ?? makeDefaultBranchConfig(selectedBranch, branchCount);

  const updateSelected = (patch: Partial<BranchConfig>) => {
    setBranchConfigs((prev) => {
      const next = [...prev];
      next[selectedBranch] = { ...(next[selectedBranch] ?? makeDefaultBranchConfig(selectedBranch, branchCount)), ...patch };
      return next;
    });
  };

  const copyLayout = async () => {
    const text = JSON.stringify({
      branchCount,
      blendStrength,
      branchOpacity,
      windEnabled,
      branches: branchConfigs.slice(0, branchCount),
    }, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice("Copied layout JSON.");
    } catch {
      setCopyNotice("Copy failed. Check clipboard permissions.");
    }
    window.setTimeout(() => setCopyNotice(""), 1400);
  };

  return (
    <div className="win95-desktop">
      <Window
        title="Weeping Willow Tree"
        width={contentWidth}
        contentClassName="flex flex-col items-center gap-2"
        contentStyle={{ padding: `${contentPadding}px` }}
      >
        <div className="win95-panel w-full" style={{ minHeight: `${headerPanelHeight}px` }}>
          <p className="font-bold">Weeping Willow</p>
          <p className="win95-subtitle">Design mode: drag anchor points to move branches, mouse wheel to scale selected branch length.</p>
        </div>
        <div className="win95-subtitle w-full text-left" style={{ paddingTop: 6 }}>
          Willow Tree image by Margaret Pokorny: 
          <a href="https://friendsofthepublicgarden.org/2018/01/17/meet-the-trees-the-weeping-willow/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://friendsofthepublicgarden.org/2018/01/17/meet-the-trees-the-weeping-willow/</a>
        </div>

        <div className="win95-panel w-full flex items-center gap-2">
          <button type="button" className="win95-button" onClick={() => setDesignMode((v) => !v)}>
            Design: {designMode ? "On" : "Off"}
          </button>
          <button
            type="button"
            className="win95-button"
            aria-pressed={windEnabled}
            onClick={() => setWindEnabled((v) => !v)}
          >
            Wind: {windEnabled ? "On" : "Off"}
          </button>
        </div>

        {designMode && (
          <div className="win95-panel w-full flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="win95-button"
              onClick={() => setBranchCount((count) => Math.min(MAX_BRANCHES, count + 1))}
            >
              Add Branch
            </button>
            <button
              type="button"
              className="win95-button"
              onClick={() => setBranchCount((count) => Math.max(4, count - 1))}
            >
              Remove Branch
            </button>
            <label>
              Branches
              <input
                className="win95-input ml-2"
                type="range"
                min={4}
                max={MAX_BRANCHES}
                step={1}
                value={branchCount}
                onChange={(e) => setBranchCount(Number(e.target.value))}
              />
              <span className="ml-2">{branchCount}</span>
            </label>
            <label>
              Blend
              <input
                className="win95-input ml-2"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={blendStrength}
                onChange={(e) => setBlendStrength(Number(e.target.value))}
              />
              <span className="ml-2">{blendStrength.toFixed(2)}</span>
            </label>
            <label>
              Opacity
              <input
                className="win95-input ml-2"
                type="range"
                min={0.2}
                max={1}
                step={0.01}
                value={branchOpacity}
                onChange={(e) => setBranchOpacity(Number(e.target.value))}
              />
              <span className="ml-2">{branchOpacity.toFixed(2)}</span>
            </label>
            <label>
              Branch
              <select
                className="win95-input ml-2"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(Number(e.target.value))}
              >
                {Array.from({ length: branchCount }, (_, i) => (
                  <option key={i} value={i}>{i + 1}</option>
                ))}
              </select>
            </label>
            <label>
              X
              <input
                className="win95-input ml-2"
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={selected.anchorXRatio}
                onChange={(e) => updateSelected({ anchorXRatio: Number(e.target.value) })}
              />
            </label>
            <label>
              Y
              <input
                className="win95-input ml-2"
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={selected.anchorYRatio}
                onChange={(e) => updateSelected({ anchorYRatio: Number(e.target.value) })}
              />
            </label>
            <label>
              Length
              <input
                className="win95-input ml-2"
                type="range"
                min={0.18}
                max={0.85}
                step={0.005}
                value={selected.lengthRatio}
                onChange={(e) => updateSelected({ lengthRatio: Number(e.target.value) })}
              />
            </label>
            <label>
              Width
              <input
                className="win95-input ml-2"
                type="range"
                min={8}
                max={30}
                step={0.5}
                value={selected.thickness}
                onChange={(e) => updateSelected({ thickness: Number(e.target.value) })}
              />
              <span className="ml-2">{selected.thickness.toFixed(1)}</span>
            </label>
            <button type="button" className="win95-button" onClick={copyLayout}>Copy Layout JSON</button>
            {branchCount > 14 && <span>High branch counts may reduce performance.</span>}
            {copyNotice && <span>{copyNotice}</span>}
          </div>
        )}

        <div
          className="relative win95-border-sunken bg-white overflow-hidden touch-none"
          style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {(!branchImageReady || !treeImageReady) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none z-20">
              <div className="win95-panel flex items-center gap-2 px-3 py-2">
                <img src={loadingGif} alt="Loading" className="w-5 h-5" draggable={false} />
                <span>Loading willow assets...</span>
              </div>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}
