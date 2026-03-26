import { useState, useEffect, useRef, useCallback } from 'react';
import bunnyMove from '../../assets/images/bunnyspritesheet.png';
import bunnyIdle from '../../assets/images/idlespritesheet.png';
import cottontailBackground from '../../assets/images/COTTONTAILBACKGROUND.jpg';
import loadingGif from '../../assets/images/loading.gif';
import Window from './Window';

export default function CirclePush() {
  const maxContainerWidth = 800;
  const maxContainerHeight = 600;
  const [containerSize, setContainerSize] = useState({ width: maxContainerWidth, height: maxContainerHeight });
  const [rabbitReady, setRabbitReady] = useState(false);

  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  const scale = containerWidth / maxContainerWidth;
  const contentPadding = 12;
  const contentWidth = containerWidth + contentPadding * 2;
  const headerPanelHeight = 56;
  const bunnySize = Math.max(96, Math.round(220 * scale));
  const moveFrames = 13;
  const idleFrames = 8;
  const hitboxScale = 0.8;
  const hitboxSize = Math.round(bunnySize * hitboxScale);
  const radius = Math.round(hitboxSize / 2);
  const pushRadius = 150;
  const minDepthScale = 0.78;
  const maxDepthScale = 1.22;

  const containerRef = useRef<HTMLDivElement>(null);
  const bunnyRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: -9999, y: -9999 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const circlePosRef = useRef({ x: maxContainerWidth / 2, y: maxContainerHeight / 2 });
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const wasMovingRef = useRef(false);
  const spriteModeRef = useRef<'idle' | 'move'>('idle');

  const syncBunnyVisual = useCallback(() => {
    const el = bunnyRef.current;
    if (!el || !rabbitReady) return;

    const spriteMode = spriteModeRef.current;
    const displayedFrameCount = spriteMode === 'move' ? moveFrames : idleFrames;
    const startFrame = displayedFrameCount > 1 ? 1 : 0;
    let safeFrameIndex = frameIndexRef.current % displayedFrameCount;
    if (displayedFrameCount > 1 && safeFrameIndex < startFrame) {
      safeFrameIndex = startFrame;
    }

    const pos = circlePosRef.current;
    const depth = Math.max(0, Math.min(1, containerHeight > 0 ? pos.y / containerHeight : 0));
    const depthScale = minDepthScale + (maxDepthScale - minDepthScale) * depth;
    const facingScaleX = velocityRef.current.x < -0.05 ? -1 : 1;
    el.style.left = `${pos.x - bunnySize / 2}px`;
    el.style.top = `${pos.y - bunnySize / 2}px`;
    el.style.backgroundImage = `url(${spriteMode === 'move' ? bunnyMove : bunnyIdle})`;
    el.style.backgroundPosition = `-${safeFrameIndex * bunnySize}px 0px`;
    el.style.backgroundSize = `${bunnySize * displayedFrameCount}px ${bunnySize}px`;
    el.style.transform = `scaleX(${facingScaleX}) scale(${depthScale})`;
  }, [rabbitReady, moveFrames, idleFrames, bunnySize, containerHeight]);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const onLoad = () => {
      loaded += 1;
      if (!cancelled && loaded >= 2) {
        setRabbitReady(true);
      }
    };
    const onError = () => {
      loaded += 1;
      if (!cancelled && loaded >= 2) {
        setRabbitReady(true);
      }
    };

    setRabbitReady(false);
    const moveImage = new Image();
    const idleImage = new Image();
    moveImage.onload = onLoad;
    moveImage.onerror = onError;
    idleImage.onload = onLoad;
    idleImage.onerror = onError;
    moveImage.src = bunnyMove;
    idleImage.src = bunnyIdle;

    return () => {
      cancelled = true;
    };
  }, []);

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
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [contentPadding]);

  useEffect(() => {
    circlePosRef.current = {
      x: Math.max(radius, Math.min(containerWidth - radius, circlePosRef.current.x)),
      y: Math.max(radius, Math.min(containerHeight - radius, circlePosRef.current.y)),
    };
    syncBunnyVisual();
  }, [containerWidth, containerHeight, radius, syncBunnyVisual]);

  useEffect(() => {
    syncBunnyVisual();
  }, [syncBunnyVisual]);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastFrameTimeRef.current == null) {
        lastFrameTimeRef.current = time;
      }
      const deltaMs = Math.min(64, time - lastFrameTimeRef.current);
      lastFrameTimeRef.current = time;

      const mousePos = mousePosRef.current;
      const friction = 0.95;

      const stepBunny = (pos: { x: number; y: number }, velRef: React.MutableRefObject<{ x: number; y: number }>) => {
        const dx = pos.x - mousePos.x;
        const dy = pos.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let forceX = 0;
        let forceY = 0;
        if (distance < pushRadius && distance > 0) {
          const force = (pushRadius - distance) / pushRadius;
          forceX = (dx / distance) * force * 2;
          forceY = (dy / distance) * force * 2;
        }

        let newVelX = (velRef.current.x + forceX) * friction;
        let newVelY = (velRef.current.y + forceY) * friction;

        let newX = pos.x + newVelX;
        let newY = pos.y + newVelY;

        if (newX - radius < 0 || newX + radius > containerWidth) {
          newVelX = -newVelX * 0.8;
          newX = Math.max(radius, Math.min(containerWidth - radius, newX));
        }
        if (newY - radius < 0 || newY + radius > containerHeight) {
          newVelY = -newVelY * 0.8;
          newY = Math.max(radius, Math.min(containerHeight - radius, newY));
        }

        velRef.current = { x: newVelX, y: newVelY };
        return { x: newX, y: newY };
      };

        const nextPos = stepBunny(circlePosRef.current, velocityRef);

        circlePosRef.current = nextPos;

        const speedA = Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.y);
        const moving = speedA > 0.35;
      if (moving !== wasMovingRef.current) {
        const nextMode = moving ? 'move' : 'idle';
        const nextFrameCount = nextMode === 'move' ? moveFrames : idleFrames;
        const startFrame = nextFrameCount > 1 ? 1 : 0;
        frameIndexRef.current = startFrame;
        frameTimerRef.current = 0;
        wasMovingRef.current = moving;
        spriteModeRef.current = nextMode;
      }

      const frameCount = spriteModeRef.current === 'move' ? moveFrames : idleFrames;
      const frameDuration = spriteModeRef.current === 'move' ? 1000 / 15 : 1000 / 10;
      const startFrame = frameCount > 1 ? 1 : 0;
      frameTimerRef.current += deltaMs;
      if (frameTimerRef.current >= frameDuration) {
        const stepCount = Math.floor(frameTimerRef.current / frameDuration);
        frameTimerRef.current %= frameDuration;
        if (frameCount > 1) {
          const cycleCount = frameCount - startFrame;
          const baseIndex = Math.max(startFrame, frameIndexRef.current) - startFrame;
          frameIndexRef.current = ((baseIndex + stepCount) % cycleCount) + startFrame;
        } else {
          frameIndexRef.current = 0;
        }
        } else if (frameIndexRef.current >= frameCount) {
          frameIndexRef.current = startFrame;
        }

        syncBunnyVisual();

        animationRef.current = requestAnimationFrame(animate);
      };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameTimeRef.current = null;
    };
  }, [containerWidth, containerHeight, radius, pushRadius, idleFrames, moveFrames, syncBunnyVisual]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(containerWidth, e.clientX - rect.left));
    const y = Math.max(0, Math.min(containerHeight, e.clientY - rect.top));

    mousePosRef.current = { x, y };
  };

  return (
    <div className="win95-desktop">
      <Window
        title="Eastern Cottontail"
        width={contentWidth}
        contentClassName="flex flex-col items-center gap-2"
        contentStyle={{ padding: `${contentPadding}px` }}
      >
        <div
          className="win95-panel w-full flex flex-wrap items-center justify-between gap-2"
          style={{ minHeight: `${headerPanelHeight}px` }}
        >
          <div>
            <p className="font-bold">Eastern Cottontail Rabbit</p>
            <p className="win95-subtitle">Whenever I saw these rabbits, they would stop when observed, and then flee when I would get close. Use cursor to chase the rabbit.</p>
          </div>
        </div>
        <div className="win95-subtitle w-full text-left" style={{ paddingTop: 6 }}>
          Eastern Cotton Tail footage by MikeBlairOutdoors: 
          <a href="https://www.youtube.com/watch?v=VdFGhqMIGoE&t=2s"target="_blank" rel="noreferrer" className="text-blue-600 underline">https://www.youtube.com/watch?v=VdFGhqMIGoE&t=2s</a>
        </div>
        <div
          ref={containerRef}
          className="relative win95-border-sunken overflow-hidden touch-none"
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            mousePosRef.current = { x: -9999, y: -9999 };
          }}
        >
        <img
          src={cottontailBackground}
          alt="Cottontail background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
          style={{ zIndex: 0 }}
        />

        {/* Bunny A */}
        {rabbitReady && (
          <div
            ref={bunnyRef}
            className="absolute"
            style={{
              width: `${bunnySize}px`,
              height: `${bunnySize}px`,
              left: `${circlePosRef.current.x - bunnySize / 2}px`,
              top: `${circlePosRef.current.y - bunnySize / 2}px`,
              backgroundRepeat: "no-repeat",
              transformOrigin: "center",
              willChange: "transform,left,top,background-position",
              imageRendering: "auto",
            }}
          >
            <div
              className="absolute debug-only"
              style={{
                width: `${hitboxSize}px`,
                height: `${hitboxSize}px`,
                left: `${(bunnySize - hitboxSize) / 2}px`,
                top: `${(bunnySize - hitboxSize) / 2}px`,
                border: "2px solid rgba(239, 68, 68, 0.85)",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {!rabbitReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none">
            <div className="win95-panel flex items-center gap-2 px-3 py-2">
              <img src={loadingGif} alt="Loading" className="w-5 h-5" draggable={false} />
              <span>Loading rabbit...</span>
            </div>
          </div>
        )}
        </div>
      </Window>
    </div>
  );
}
