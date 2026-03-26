import { useEffect, useMemo, useRef, useState } from "react";
import Window from "./Window";
import mossBrush from "../../assets/images/Moss.png";
import mossBackground from "../../assets/images/mossbackgroundlowquality.jpg";
import loadingGif from "../../assets/images/loading.gif";

type Point = { x: number; y: number };
type QualityPreset = "low" | "balanced" | "high";

export default function JointToothMoss() {
  const maxContainerWidth = 800;
  const maxContainerHeight = 600;
  const contentPadding = 12;
  const headerPanelHeight = 56;

  const [containerSize, setContainerSize] = useState({ width: maxContainerWidth, height: maxContainerHeight });
  const [brushSize, setBrushSize] = useState(26);
  const [brushOpacity, setBrushOpacity] = useState(0.65);
  const [quality, setQuality] = useState<QualityPreset>("low");
  const [brushReady, setBrushReady] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);

  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const mossImageRef = useRef<HTMLImageElement | null>(null);
  const isPaintingRef = useRef(false);
  const prevPointRef = useRef<Point | null>(null);

  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  const contentWidth = containerWidth + contentPadding * 2;

  useEffect(() => {
    const updateSize = () => {
      const horizontalGutter = 24 + contentPadding * 2;
      const verticalGutter = 220 + contentPadding * 2 + headerPanelHeight + 16;
      const maxWidth = Math.max(280, Math.min(maxContainerWidth, window.innerWidth - horizontalGutter));
      const maxHeight = Math.max(210, Math.min(maxContainerHeight, window.innerHeight - verticalGutter));
      const fromWidthHeight = maxWidth * 0.75;

      if (fromWidthHeight <= maxHeight) {
        setContainerSize({ width: Math.round(maxWidth), height: Math.round(fromWidthHeight) });
        return;
      }

      const widthFromHeight = maxHeight * (4 / 3);
      setContainerSize({ width: Math.round(widthFromHeight), height: Math.round(maxHeight) });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    setBrushReady(false);
    const image = new Image();
    image.src = mossBrush;
    image.onload = () => {
      mossImageRef.current = image;
      setBrushReady(true);
    };
    image.onerror = () => {
      setBrushReady(true);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBackgroundReady(false);
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setBackgroundReady(true);
    };
    image.onerror = () => {
      if (!cancelled) setBackgroundReady(true);
    };
    image.src = mossBackground;
    return () => {
      cancelled = true;
    };
  }, []);

  const assetsReady = brushReady && backgroundReady;

  const qualityConfig = useMemo(() => {
    if (quality === "high") {
      return { dpr: Math.min(window.devicePixelRatio || 1, 1.5), spacing: 5, jitterScale: 0.12, jitterRotation: 0.18 };
    }
    if (quality === "balanced") {
      return { dpr: 1, spacing: 7, jitterScale: 0.08, jitterRotation: 0.12 };
    }
    return { dpr: 1, spacing: 10, jitterScale: 0.0, jitterRotation: 0.0 };
  }, [quality]);

  useEffect(() => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = qualityConfig.dpr;
    canvas.width = Math.round(containerWidth * dpr);
    canvas.height = Math.round(containerHeight * dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, containerWidth, containerHeight);
  }, [containerWidth, containerHeight, qualityConfig]);

  const getPoint = (clientX: number, clientY: number): Point | null => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const stampAt = (x: number, y: number) => {
    const canvas = paintCanvasRef.current;
    const img = mossImageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleJitter = qualityConfig.jitterScale;
    const rotJitter = qualityConfig.jitterRotation;
    const scale = 1 + (Math.random() * 2 - 1) * scaleJitter;
    const rotation = (Math.random() * 2 - 1) * rotJitter;

    const drawWidth = brushSize * scale;
    const drawHeight = drawWidth * (img.height / img.width);

    ctx.save();
    ctx.translate(x, y);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }
    ctx.globalAlpha = brushOpacity;
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  };

  const paintStrokeTo = (next: Point) => {
    const prev = prevPointRef.current;
    if (!prev) {
      stampAt(next.x, next.y);
      prevPointRef.current = next;
      return;
    }

    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / qualityConfig.spacing));

    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      stampAt(prev.x + dx * t, prev.y + dy * t);
    }

    prevPointRef.current = next;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getPoint(e.clientX, e.clientY);
    if (!pt) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isPaintingRef.current = true;
    prevPointRef.current = pt;
    stampAt(pt.x, pt.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    const pt = getPoint(e.clientX, e.clientY);
    if (!pt) return;
    paintStrokeTo(pt);
  };

  const stopPainting = () => {
    isPaintingRef.current = false;
    prevPointRef.current = null;
  };

  const clearMoss = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, containerWidth, containerHeight);
  };

  return (
    <div className="win95-desktop">
      <Window
        title="Joint Tooth Mosses"
        width={contentWidth}
        contentClassName="flex flex-col items-center gap-2"
        contentStyle={{ padding: `${contentPadding}px` }}
      >
        <div className="win95-panel w-full" style={{ minHeight: `${headerPanelHeight}px` }}>
          <p className="font-bold">Joint Tooth Mosses</p>
          <p className="win95-subtitle">Joint Tooth Mosses are a family of mosses. The moss appeared like it had been painted across the environment. Hold mouse down and paint moss onto the image.</p>
        </div>

        <div className="win95-panel w-full flex flex-wrap items-center gap-2">
          <label>
            Quality
            <select
              className="win95-input ml-2"
              value={quality}
              onChange={(e) => setQuality(e.target.value as QualityPreset)}
            >
              <option value="low">Low</option>
              <option value="balanced">Balanced</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            Brush Size
            <input
              className="win95-input ml-2"
              type="range"
              min={8}
              max={48}
              step={1}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
            <span className="ml-2">{brushSize}</span>
          </label>

          <label>
            Opacity
            <input
              className="win95-input ml-2"
              type="range"
              min={0.2}
              max={1}
              step={0.01}
              value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
            />
            <span className="ml-2">{brushOpacity.toFixed(2)}</span>
          </label>

          <button type="button" className="win95-button" onClick={clearMoss}>Clear</button>
        </div>

        <div
          className="relative win95-border-sunken bg-white overflow-hidden touch-none"
          style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
        >
          <img
            src={mossBackground}
            alt="Moss painting background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
          <canvas
            ref={paintCanvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPainting}
            onPointerCancel={stopPainting}
            onPointerLeave={stopPainting}
          />

          {!assetsReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none">
              <div className="win95-panel flex items-center gap-2 px-3 py-2">
                <img src={loadingGif} alt="Loading" className="w-5 h-5" draggable={false} />
                <span>Loading moss assets...</span>
              </div>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}
