import { useEffect, useMemo, useRef, useState } from "react";
import Window from "./Window";
import turkeyBody from "../../assets/images/TURKEYBODY.png";
import neckTexture from "../../assets/images/TESTNECKTEXTURE.png";
import turkeyHead from "../../assets/images/HEADTESTTEXTURE.png";
import turkeyBackground from "../../assets/images/TURKEYBACKGROUND.jpg";
import loadingGif from "../../assets/images/loading.gif";

type Point = { x: number; y: number };
type ChainPoint = { x: number; y: number; oldx: number; oldy: number };
type PlacementData = { xRatio: number; yRatio: number };

const DEFAULT_PLACEMENT: PlacementData = {
  xRatio: 49 / 800,
  yRatio: 25 / 600,
};

export default function WildTurkey() {
  const debugNeckOnly = false;
  const headScale = 0.8;
  const maxContainerWidth = 800;
  const maxContainerHeight = 600;
  const contentPadding = 12;
  const headerPanelHeight = 56;

  const [containerSize, setContainerSize] = useState({ width: maxContainerWidth, height: maxContainerHeight });
  const [headPose, setHeadPose] = useState({ x: 0, y: 0, angle: 0, stretch: 1 });
  const [freezeFollow, setFreezeFollow] = useState(false);
  const [isDraggingPlacement, setIsDraggingPlacement] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [placementOffsetRatio, setPlacementOffsetRatio] = useState<PlacementData>(DEFAULT_PLACEMENT);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const currentVecRef = useRef<Point>({ x: 0, y: 0 });
  const neckPointsRef = useRef<ChainPoint[]>([]);
  const dragRef = useRef({ active: false, startMouseX: 0, startMouseY: 0, startOffsetXRatio: 0, startOffsetYRatio: 0 });
  const headPoseRef = useRef(headPose);
  const defaultPlacementRef = useRef<PlacementData>(DEFAULT_PLACEMENT);

  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  const placementOffsetPx = {
    x: placementOffsetRatio.xRatio * containerWidth,
    y: placementOffsetRatio.yRatio * containerHeight,
  };
  const contentWidth = containerWidth + contentPadding * 2;

  const layout = useMemo(() => {
    const referenceW = 216;
    const referenceH = 202;
    const bodyW = 192;
    const bodyH = 186;
    const headW = 146;
    const headH = 231;
    const headDisplayScale = 0.24;

    const fitScale = Math.min((containerWidth * 0.72) / referenceW, (containerHeight * 0.8) / referenceH);
    const compW = referenceW * fitScale;
    const compH = referenceH * fitScale;
    const ox = (containerWidth - compW) / 2;
    const oy = (containerHeight - compH) / 2;

    const bodyX = ox + 0 * fitScale;
    const bodyY = oy + 16 * fitScale;
    const headNeutralX = ox + 160 * fitScale;
    const headNeutralY = oy + 7 * fitScale;

    const debugNeckIdleLength = 52 * fitScale;
    const socketX = debugNeckOnly ? (containerWidth * 0.5) - debugNeckIdleLength : ox + 152 * fitScale;
    const socketY = debugNeckOnly ? containerHeight * 0.5 : oy + 52 * fitScale;

    const headPivotX = 8 * fitScale;
    const headPivotY = 16 * fitScale;

    const neutralPivotX = headNeutralX + headPivotX;
    const neutralPivotY = headNeutralY + headPivotY;
    const neutralVec = debugNeckOnly
      ? { x: debugNeckIdleLength, y: 0 }
      : { x: neutralPivotX - socketX, y: neutralPivotY - socketY };

    return {
      fitScale,
      bodyX,
      bodyY,
      bodyW: bodyW * fitScale,
      bodyH: bodyH * fitScale,
      headW: headW * fitScale * headDisplayScale,
      headH: headH * fitScale * headDisplayScale,
      headPivotX,
      headPivotY,
      socketX,
      socketY,
      neutralVec,
      maxDistance: 105 * fitScale,
      neutralDistance: Math.sqrt(neutralVec.x * neutralVec.x + neutralVec.y * neutralVec.y),
      neckOuterWidth: Math.max(7, 14 * fitScale),
    };
  }, [containerWidth, containerHeight]);

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
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAssetsReady(false);
    const sources = [turkeyBody, neckTexture, turkeyHead, turkeyBackground];
    let loaded = 0;

    const markLoaded = () => {
      loaded += 1;
      if (!cancelled && loaded >= sources.length) {
        setAssetsReady(true);
      }
    };

    sources.forEach((src) => {
      const image = new Image();
      image.onload = markLoaded;
      image.onerror = markLoaded;
      image.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    headPoseRef.current = headPose;
  }, [headPose]);

  useEffect(() => {
    currentVecRef.current = layout.neutralVec;
    const neutralAngle = Math.atan2(layout.neutralVec.y, layout.neutralVec.x);
    const neutralPose = { x: layout.neutralVec.x, y: layout.neutralVec.y, angle: neutralAngle, stretch: 1 };
    headPoseRef.current = neutralPose;
    setHeadPose(neutralPose);

    const pointCount = 6;
    neckPointsRef.current = Array.from({ length: pointCount }, (_, i) => {
      const t = i / (pointCount - 1);
      const x = layout.socketX + layout.neutralVec.x * t;
      const y = layout.socketY + layout.neutralVec.y * t;
      return { x, y, oldx: x, oldy: y };
    });
  }, [layout]);

  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      const mouse = mouseRef.current;
      let target = layout.neutralVec;

      if (freezeFollow) {
        target = currentVecRef.current;
      } else if (mouse.active) {
        const dx = mouse.x - layout.socketX;
        const dy = mouse.y - layout.socketY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.001) {
          const clamped = Math.min(dist, layout.maxDistance);
          target = { x: (dx / dist) * clamped, y: (dy / dist) * clamped };
        }
      }

      const current = currentVecRef.current;
      const smoothing = 0.18;
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;
      currentVecRef.current = current;

      const direction = Math.atan2(current.y, current.x);
      const distance = Math.sqrt(current.x * current.x + current.y * current.y);
      const relaxedDistance = layout.neutralDistance + (distance - layout.neutralDistance) * 0.72;
      const desiredTipX = layout.socketX + Math.cos(direction) * relaxedDistance;
      const desiredTipY = layout.socketY + Math.sin(direction) * relaxedDistance;

      const points = neckPointsRef.current;
      const lastIndex = points.length - 1;
      if (lastIndex > 0) {
        const damping = 0.9;
        for (let i = 1; i <= lastIndex; i += 1) {
          const p = points[i];
          const vx = (p.x - p.oldx) * damping;
          const vy = (p.y - p.oldy) * damping;
          p.oldx = p.x;
          p.oldy = p.y;
          p.x += vx;
          p.y += vy;
        }

        const tip = points[lastIndex];
        tip.x += (desiredTipX - tip.x) * 0.68;
        tip.y += (desiredTipY - tip.y) * 0.68;

        const segmentLength = Math.max(1, relaxedDistance / lastIndex);
        for (let iteration = 0; iteration < 6; iteration += 1) {
          points[0].x = layout.socketX;
          points[0].y = layout.socketY;

          for (let i = 0; i < lastIndex; i += 1) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segDist = Math.sqrt(dx * dx + dy * dy);
            if (segDist < 0.0001) continue;
            const diff = (segDist - segmentLength) / segDist;

            if (i === 0) {
              p2.x -= dx * diff;
              p2.y -= dy * diff;
            } else {
              const adjustX = dx * 0.5 * diff;
              const adjustY = dy * 0.5 * diff;
              p1.x += adjustX;
              p1.y += adjustY;
              p2.x -= adjustX;
              p2.y -= adjustY;
            }
          }

          points[0].x = layout.socketX;
          points[0].y = layout.socketY;
          tip.x += (desiredTipX - tip.x) * 0.55;
          tip.y += (desiredTipY - tip.y) * 0.55;
        }
      } else {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const tip = points[lastIndex];
      const preTip = points[Math.max(0, lastIndex - 1)];
      const angle = Math.atan2(tip.y - preTip.y, tip.x - preTip.x);
      const headX = tip.x - layout.socketX;
      const headY = tip.y - layout.socketY;
      const headDistance = Math.sqrt(headX * headX + headY * headY);
      const extensionRatio = layout.maxDistance > layout.neutralDistance
        ? Math.max(0, (headDistance - layout.neutralDistance) / (layout.maxDistance - layout.neutralDistance))
        : 0;
      const stretch = 1 + extensionRatio * 0.12;

      const nextPose = { x: headX, y: headY, angle, stretch };
      const prevPose = headPoseRef.current;
      const poseChanged =
        Math.abs(nextPose.x - prevPose.x) > 0.12 ||
        Math.abs(nextPose.y - prevPose.y) > 0.12 ||
        Math.abs(nextPose.angle - prevPose.angle) > 0.003 ||
        Math.abs(nextPose.stretch - prevPose.stretch) > 0.002;

      if (poseChanged) {
        headPoseRef.current = nextPose;
        setHeadPose(nextPose);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [layout, freezeFollow]);

  useEffect(() => {
    if (!freezeFollow) return;

    const onMouseUp = () => {
      dragRef.current.active = false;
      setIsDraggingPlacement(false);
    };

    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [freezeFollow]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    if (freezeFollow && dragRef.current.active) {
      const dx = localX - dragRef.current.startMouseX;
      const dy = localY - dragRef.current.startMouseY;
      setPlacementOffsetRatio({
        xRatio: dragRef.current.startOffsetXRatio + (containerWidth > 0 ? dx / containerWidth : 0),
        yRatio: dragRef.current.startOffsetYRatio + (containerHeight > 0 ? dy / containerHeight : 0),
      });
      return;
    }

    if (freezeFollow) {
      mouseRef.current.active = false;
      return;
    }

    mouseRef.current.x = localX;
    mouseRef.current.y = localY;
    mouseRef.current.active = true;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!freezeFollow || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    dragRef.current.active = true;
    dragRef.current.startMouseX = localX;
    dragRef.current.startMouseY = localY;
    dragRef.current.startOffsetXRatio = placementOffsetRatio.xRatio;
    dragRef.current.startOffsetYRatio = placementOffsetRatio.yRatio;
    setIsDraggingPlacement(true);
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
    dragRef.current.active = false;
    setIsDraggingPlacement(false);
  };

  const savePlacement = () => {
    defaultPlacementRef.current = placementOffsetRatio;
  };

  const resetPlacement = () => {
    setPlacementOffsetRatio(defaultPlacementRef.current);
  };

  const neckPoints = neckPointsRef.current;
  const neckSegments = neckPoints.length < 2
    ? []
    : neckPoints.slice(0, -1).map((point, i) => {
      const next = neckPoints[i + 1];
      const dx = next.x - point.x;
      const dy = next.y - point.y;
      const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const t = i / Math.max(1, neckPoints.length - 2);
      const thickness = layout.neckOuterWidth * (1 - t * 0.42) * (1 + (headPose.stretch - 1) * 0.3);

      return {
        x: point.x,
        y: point.y,
        length,
        angle,
        thickness,
        t,
      };
    });
  const headAttachment = (() => {
    const last = neckSegments[neckSegments.length - 1];
    if (!last) {
      return {
        x: layout.socketX + headPose.x,
        y: layout.socketY + headPose.y,
        angle: (headPose.angle * 180) / Math.PI,
      };
    }
    const angleRad = (last.angle * Math.PI) / 180;
    const tipX = last.x + Math.cos(angleRad) * last.length;
    const tipY = last.y + Math.sin(angleRad) * last.length;
    const normalX = -Math.sin(angleRad);
    const normalY = Math.cos(angleRad);

    return {
      x: tipX - normalX * (last.thickness * 0.52),
      y: tipY - normalY * (last.thickness * 0.52),
      angle: last.angle,
    };
  })();
  const topStartIndex = neckSegments.findIndex((segment) => segment.t >= 0.6);
  const segmentedNeckSegments = topStartIndex < 0 ? neckSegments : neckSegments.slice(0, topStartIndex);
  const topNeckBlock = (() => {
    if (topStartIndex < 0) return null;
    const start = neckSegments[topStartIndex];
    const last = neckSegments[neckSegments.length - 1];
    if (!start || !last) return null;

    const lastAngleRad = (last.angle * Math.PI) / 180;
    const tipX = last.x + Math.cos(lastAngleRad) * last.length;
    const tipY = last.y + Math.sin(lastAngleRad) * last.length;
    const dx = tipX - start.x;
    const dy = tipY - start.y;
    const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      x: start.x,
      y: start.y,
      length,
      angle,
      thickness: Math.max(2, (start.thickness + last.thickness) * 0.5),
    };
  })();
  const headAnchor = (() => {
    const source = topNeckBlock ?? neckSegments[neckSegments.length - 1];
    if (!source) {
      return {
        x: headAttachment.x,
        y: headAttachment.y,
        angle: headAttachment.angle,
      };
    }

    const angleRad = (source.angle * Math.PI) / 180;
    const tipX = source.x + Math.cos(angleRad) * source.length;
    const tipY = source.y + Math.sin(angleRad) * source.length;
    const normalX = -Math.sin(angleRad);
    const normalY = Math.cos(angleRad);

    return {
      x: tipX - normalX * (source.thickness * 0.5),
      y: tipY - normalY * (source.thickness * 0.5),
      angle: source.angle,
    };
  })();

  return (
    <div className="win95-desktop">
      <Window
        title="Wild Turkey"
        width={contentWidth}
        contentClassName="flex flex-col items-center gap-2"
        contentStyle={{ padding: `${contentPadding}px` }}
      >
        <div className="win95-panel w-full" style={{ minHeight: `${headerPanelHeight}px` }}>
          <p className="font-bold">Wild Turkey</p>
          <p className="win95-subtitle">Their necks were unnervingly creepy, maybe cause they were following me. Watch out, they'll follow your cursor too</p>
        </div>

        <div className="win95-panel w-full flex items-center gap-2">
          <button
            type="button"
            className="win95-button"
            aria-pressed={freezeFollow}
            onClick={() => {
              setFreezeFollow((v) => !v);
              mouseRef.current.active = false;
            }}
          >
            Freeze Follow: {freezeFollow ? "On" : "Off"}
          </button>
          <button type="button" className="win95-button debug-only" onClick={savePlacement}>Save Placement</button>
          <button type="button" className="win95-button debug-only" onClick={resetPlacement}>Reset Placement</button>
        </div>

        <div
          ref={containerRef}
          className="relative win95-border-sunken overflow-hidden touch-none"
          style={{ width: `${containerWidth}px`, height: `${containerHeight}px`, cursor: freezeFollow ? (isDraggingPlacement ? "grabbing" : "grab") : undefined }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={turkeyBackground}
            alt="Turkey background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
            style={{ zIndex: 0, objectPosition: "center 92%" }}
          />

          {!debugNeckOnly && (
            <img
              src={turkeyBody}
              alt="Turkey body"
              draggable={false}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${layout.bodyX}px`,
                top: `${layout.bodyY}px`,
                width: `${layout.bodyW}px`,
                height: `${layout.bodyH}px`,
                zIndex: 40,
              }}
            />
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `translate(${placementOffsetPx.x}px, ${placementOffsetPx.y}px)`, zIndex: 10 }}
          >
          {segmentedNeckSegments.map((segment, i) => (
            <div
              key={`neck-seg-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${segment.x}px`,
                top: `${segment.y}px`,
                width: `${segment.length + 2}px`,
                height: `${segment.thickness}px`,
                transform: `translateY(${-segment.thickness / 2}px) rotate(${segment.angle}deg)`,
                transformOrigin: "0 50%",
                overflow: "hidden",
                borderRadius: `${segment.thickness}px`,
                opacity: 0.95 - segment.t * 0.14,
                zIndex: 20,
                backgroundColor: "rgba(94, 62, 39, 0.16)",
              }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none select-none"
                style={{
                  backgroundImage: `url(${neckTexture})`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "35px 132px",
                  backgroundPosition: `${-i * 9}px 50%`,
                  filter: "saturate(0.98) brightness(0.98) contrast(1.08)",
                }}
              />

            </div>
          ))}

          {topNeckBlock && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${topNeckBlock.x}px`,
                top: `${topNeckBlock.y}px`,
                width: `${topNeckBlock.length + 2}px`,
                height: `${topNeckBlock.thickness}px`,
                transform: `translateY(${-topNeckBlock.thickness / 2}px) rotate(${topNeckBlock.angle}deg)`,
                transformOrigin: "0 50%",
                overflow: "visible",
                borderRadius: `${topNeckBlock.thickness}px`,
                zIndex: 30,
                backgroundColor: "rgba(94, 62, 39, 0.2)",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none select-none"
                style={{
                  backgroundImage: `url(${neckTexture})`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "35px 132px",
                  backgroundPosition: "0 50%",
                  filter: "saturate(1.02) brightness(1.02) contrast(1.06)",
                }}
              />

              <div
                className="absolute pointer-events-none debug-only"
                style={{
                  left: "100%",
                  top: "0%",
                  width: "8px",
                  height: "8px",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "999px",
                  background: "#ff0000",
                  zIndex: 80,
                }}
              />

            </div>
          )}

          <div
            className="absolute pointer-events-none"
            style={{
              left: `${headAnchor.x}px`,
              top: `${headAnchor.y - (layout.headH * headScale)}px`,
              width: `${layout.headW * headScale}px`,
              height: `${layout.headH * headScale}px`,
              transform: `rotate(${headAnchor.angle + 90}deg)`,
              transformOrigin: "0 100%",
              zIndex: 60,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none debug-only"
              style={{
                border: "2px solid #00aa00",
                background: "rgba(0, 170, 0, 0.08)",
              }}
            />
            <img
              src={turkeyHead}
              alt="Turkey head"
              draggable={false}
              className="absolute select-none"
              style={{
                left: "0px",
                top: "0px",
                width: "100%",
                height: "100%",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.35))",
              }}
            />
          </div>
          </div>

          {!assetsReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none" style={{ zIndex: 100 }}>
              <div className="win95-panel flex items-center gap-2 px-3 py-2">
                <img src={loadingGif} alt="Loading" className="w-5 h-5" draggable={false} />
                <span>Loading turkey assets...</span>
              </div>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}
