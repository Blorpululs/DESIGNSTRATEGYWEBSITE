import { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';
import duckImage from '../../assets/images/CROPPED DUCK NO LEGS.png';
import duckImageFallback from '../../assets/images/Duck 1 No Legs Transparent.png';
import mallardBackground from '../../assets/images/MALLARDBACKGROUND.jpg';
import loadingGif from '../../assets/images/loading.gif';
import Window from './Window';

export default function WaterPhysics() {
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const ballElRef = useRef<HTMLDivElement>(null);
  const hitboxElRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballBodyRef = useRef<Matter.Body | null>(null);
  const animationRef = useRef<number | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const bobTimeRef = useRef(0);
  const hasEnteredWaterRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const waterSurfaceFillPathRef = useRef<SVGPathElement>(null);
  const waterSurfaceLinePathRef = useRef<SVGPathElement>(null);
  const duckWetOverlayRef = useRef<HTMLDivElement>(null);
  const waveHeightsRef = useRef<number[]>([]);
  const waveVelocitiesRef = useRef<number[]>([]);
  const waveLeftDeltasRef = useRef<number[]>([]);
  const waveRightDeltasRef = useRef<number[]>([]);
  const wasBallNearSurfaceRef = useRef(false);
  const surfaceImpactCooldownRef = useRef(0);
  const currentHitboxWRef = useRef(0);
  const currentHitboxHRef = useRef(0);
  const visualTiltDegRef = useRef(0);
  const tiltVelocityRef = useRef(0);
  const wetRatioRef = useRef(0);
  const wallsRef = useRef<Matter.Body[]>([]);
  const metricsRef = useRef({
    containerWidth: 800,
    containerHeight: 600,
    waterLevel: 420,
    waveBandHeight: 64,
    waveBaseline: 32,
    waterFillHeight: 244,
    wavePointCount: 32,
  });

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
  };

  const maxContainerWidth = 800;
  const maxContainerHeight = 600;
  const targetMass = 6.82;
  const [baseContainerSize, setBaseContainerSize] = useState({ width: maxContainerWidth, height: maxContainerHeight });
  const [duckSrc, setDuckSrc] = useState(duckImage);
  const [duckReady, setDuckReady] = useState(false);
  const triedFallbackRef = useRef(false);

  const { width: containerWidth, height: containerHeight } = baseContainerSize;
  const scaleX = containerWidth / maxContainerWidth;
  const scaleY = containerHeight / maxContainerHeight;
  const duckScale = Math.min(scaleX, scaleY);
  const contentPadding = 12;
  const contentWidth = containerWidth + contentPadding * 2;
  const headerPanelHeight = 56;
  const waterLevel = Math.round(containerHeight * 0.7);
  const baseDensity = 0.001;
  const duckAspectRatio = 1083 / 481;
  const duckBaseWidth = 180;
  const duckVisualW = Math.max(56, Math.round(duckBaseWidth * duckScale));
  const duckVisualH = Math.max(25, Math.round(duckVisualW / duckAspectRatio));
  const hitboxW = duckVisualW;
  const hitboxH = duckVisualH;
  const initialBallY = Math.max(hitboxH / 2 + 12, Math.round(58 * scaleY));
  const waveBandHeight = Math.max(44, Math.round(64 * scaleY));
  const waveBaseline = Math.round(waveBandHeight * 0.5);
  const waterFillHeight = Math.round(containerHeight - waterLevel + waveBandHeight);
  const wavePointCount = Math.max(20, Math.min(56, Math.round(containerWidth / 18)));

  const buildTopWavePath = (heights: number[]) => {
    const { containerWidth: width, waveBaseline: baseline } = metricsRef.current;
    if (heights.length < 2) return `M 0 ${baseline} L ${width} ${baseline}`;

    const step = width / (heights.length - 1);
    let d = `M 0 ${baseline + heights[0]}`;
    for (let i = 1; i < heights.length; i += 1) {
      d += ` L ${i * step} ${baseline + heights[i]}`;
    }
    return d;
  };

  const renderWaterSurface = () => {
    const heights = waveHeightsRef.current;
    if (heights.length === 0) return;

    const { containerWidth: width, waterFillHeight: fillHeight } = metricsRef.current;
    const topPath = buildTopWavePath(heights);
    const fillPath = `${topPath} L ${width} ${fillHeight} L 0 ${fillHeight} Z`;

    if (waterSurfaceFillPathRef.current) {
      waterSurfaceFillPathRef.current.setAttribute('d', fillPath);
    }

    if (waterSurfaceLinePathRef.current) {
      waterSurfaceLinePathRef.current.setAttribute('d', topPath);
    }
  };

  useEffect(() => {
    const updateSize = () => {
      const horizontalGutter = 24 + contentPadding * 2;
      const verticalGutter = 240 + contentPadding * 2 + headerPanelHeight + 16;
      const maxWidth = Math.max(280, Math.min(maxContainerWidth, window.innerWidth - horizontalGutter));
      const maxHeight = Math.max(210, Math.min(maxContainerHeight, window.innerHeight - verticalGutter));

      const fromWidthHeight = maxWidth * 0.75;

      if (fromWidthHeight <= maxHeight) {
        setBaseContainerSize({ width: Math.round(maxWidth), height: Math.round(fromWidthHeight) });
        return;
      }

      const widthFromHeight = maxHeight * (4 / 3);
      setBaseContainerSize({ width: Math.round(widthFromHeight), height: Math.round(maxHeight) });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [contentPadding]);

  useEffect(() => {
    let cancelled = false;
    setDuckReady(false);

    const preloader = new Image();
    preloader.onload = () => {
      if (!cancelled) {
        setDuckReady(true);
      }
    };
    preloader.onerror = () => {
      if (cancelled) return;

      if (duckSrc !== duckImageFallback && !triedFallbackRef.current) {
        triedFallbackRef.current = true;
        setDuckSrc(duckImageFallback);
        return;
      }

      setDuckReady(true);
    };
    preloader.src = duckSrc;

    return () => {
      cancelled = true;
    };
  }, [duckSrc]);

  useEffect(() => {
    metricsRef.current = {
      containerWidth,
      containerHeight,
      waterLevel,
      waveBandHeight,
      waveBaseline,
      waterFillHeight,
      wavePointCount,
    };
  }, [containerWidth, containerHeight, waterLevel, waveBandHeight, waveBaseline, waterFillHeight, wavePointCount]);

  useEffect(() => {
    waveHeightsRef.current = new Array(wavePointCount).fill(0);
    waveVelocitiesRef.current = new Array(wavePointCount).fill(0);
    waveLeftDeltasRef.current = new Array(wavePointCount).fill(0);
    waveRightDeltasRef.current = new Array(wavePointCount).fill(0);
    wasBallNearSurfaceRef.current = false;
    surfaceImpactCooldownRef.current = 0;
    renderWaterSurface();
  }, [wavePointCount, containerWidth, waveBandHeight, waveBaseline]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const world = engine.world;
    if (wallsRef.current.length) {
      for (const wall of wallsRef.current) {
        Matter.World.remove(world, wall);
      }
    }

    const wallThickness = 50;
    const walls = [
      Matter.Bodies.rectangle(
        containerWidth / 2,
        -wallThickness / 2,
        containerWidth,
        wallThickness,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        containerWidth / 2,
        containerHeight + wallThickness / 2,
        containerWidth,
        wallThickness,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        containerWidth + wallThickness / 2,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true }
      ),
    ];

    wallsRef.current = walls;
    Matter.World.add(world, walls);

    const ball = ballBodyRef.current;
    if (ball) {
      const halfW = (currentHitboxWRef.current || hitboxW) / 2;
      const halfH = (currentHitboxHRef.current || hitboxH) / 2;
      const clampedX = clamp(ball.position.x, halfW, containerWidth - halfW);
      const clampedY = clamp(ball.position.y, halfH, containerHeight - halfH);
      Matter.Body.setPosition(ball, { x: clampedX, y: clampedY });
    }
  }, [containerWidth, containerHeight, hitboxW, hitboxH]);

  useEffect(() => {
    const ball = ballBodyRef.current;
    if (!ball) return;

    const targetW = hitboxW;
    const targetH = hitboxH;
    const currentW = currentHitboxWRef.current || targetW;
    const currentH = currentHitboxHRef.current || targetH;

    const scaleX = targetW / currentW;
    const scaleY = targetH / currentH;

    if (Math.abs(scaleX - 1) > 0.001 || Math.abs(scaleY - 1) > 0.001) {
      Matter.Body.scale(ball, scaleX, scaleY);
    }

    currentHitboxWRef.current = targetW;
    currentHitboxHRef.current = targetH;

    const currentArea = Math.max(1, targetW * targetH);
    Matter.Body.setDensity(ball, targetMass / currentArea);

    const halfW = targetW / 2;
    const halfH = targetH / 2;
    const { containerWidth: width, containerHeight: height } = metricsRef.current;
    const clampedX = clamp(ball.position.x, halfW, width - halfW);
    const clampedY = clamp(ball.position.y, halfH, height - halfH);

    if (clampedX !== ball.position.x || clampedY !== ball.position.y) {
      Matter.Body.setPosition(ball, { x: clampedX, y: clampedY });
    }
  }, [hitboxW, hitboxH]);

  // Initialize Matter.js physics engine
  useEffect(() => {
    if (!containerRef.current) return;

    // Create engine and world
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 }
    });
    const world = engine.world;
    engineRef.current = engine;

    const startX = metricsRef.current.containerWidth / 2;
    const startY = initialBallY;
    const ball = Matter.Bodies.rectangle(
      startX,
      startY,
      hitboxW,
      hitboxH,
      {
        restitution: 0.3,
        friction: 0.1,
        density: baseDensity,
        inertia: Infinity,
        render: {
          fillStyle: '#f97316'
        }
      }
    );
    const initialArea = Math.max(1, hitboxW * hitboxH);
    Matter.Body.setDensity(ball, targetMass / initialArea);
    ballBodyRef.current = ball;
    currentHitboxWRef.current = hitboxW;
    currentHitboxHRef.current = hitboxH;
    visualTiltDegRef.current = 0;
    wetRatioRef.current = 0;
    Matter.World.add(world, ball);

    // Create invisible boundary walls
    const wallThickness = 50;
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(
        metricsRef.current.containerWidth / 2, 
        -wallThickness / 2, 
        metricsRef.current.containerWidth, 
        wallThickness, 
        { isStatic: true }
      ),
      // Bottom wall
      Matter.Bodies.rectangle(
        metricsRef.current.containerWidth / 2, 
        metricsRef.current.containerHeight + wallThickness / 2, 
        metricsRef.current.containerWidth, 
        wallThickness, 
        { isStatic: true }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        -wallThickness / 2, 
        metricsRef.current.containerHeight / 2, 
        wallThickness, 
        metricsRef.current.containerHeight, 
        { isStatic: true }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        metricsRef.current.containerWidth + wallThickness / 2, 
        metricsRef.current.containerHeight / 2, 
        wallThickness, 
        metricsRef.current.containerHeight, 
        { isStatic: true }
      ),
    ];
    wallsRef.current = walls;
    Matter.World.add(world, walls);

    // Setup mouse/touch interaction for dragging
    const mouse = Matter.Mouse.create(containerRef.current);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    mouseConstraintRef.current = mouseConstraint;
    Matter.World.add(world, mouseConstraint);

    // Track dragging state
    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      isDraggingRef.current = true;
      setIsDragging(true);
    });

    Matter.Events.on(mouseConstraint, 'enddrag', () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    });

    // Animation loop
    const render = (now: number) => {
      if (!engineRef.current || !ballBodyRef.current) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }

      let delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (!Number.isFinite(delta) || delta <= 0) {
        delta = 1000 / 60;
      }

      // Clamp large frame gaps to reduce visible simulation jumps.
      delta = Math.min(delta, 1000 / 30);

      // Update physics engine
      Matter.Engine.update(engineRef.current, delta);

      const { containerWidth: width, containerHeight: height, waterLevel: level, waveBandHeight: bandHeight } = metricsRef.current;
      const ball = ballBodyRef.current;
      const currentHitboxW = currentHitboxWRef.current || hitboxW;
      const currentHitboxH = currentHitboxHRef.current || hitboxH;
      const halfW = currentHitboxW / 2;
      const halfH = currentHitboxH / 2;

      if (ball.angle !== 0 || ball.angularVelocity !== 0) {
        Matter.Body.setAngle(ball, 0);
        Matter.Body.setAngularVelocity(ball, 0);
      }
      const ballCenterY = ball.position.y;
      const ballBottom = ballCenterY + halfH;

      const waveHeights = waveHeightsRef.current;
      const waveVelocities = waveVelocitiesRef.current;
      const simulationStep = delta / (1000 / 60);

      if (waveHeights.length > 1 && waveVelocities.length === waveHeights.length) {
        const springTension = 0.02;
        const velocityDamping = 0.96;
        const spread = 0.16;
        const maxWaveDisplacement = bandHeight * 0.42;
        let leftDeltas = waveLeftDeltasRef.current;
        let rightDeltas = waveRightDeltasRef.current;

        if (leftDeltas.length !== waveHeights.length) {
          waveLeftDeltasRef.current = new Array(waveHeights.length).fill(0);
          waveRightDeltasRef.current = new Array(waveHeights.length).fill(0);
          leftDeltas = waveLeftDeltasRef.current;
          rightDeltas = waveRightDeltasRef.current;
        }

        for (let i = 0; i < waveHeights.length; i += 1) {
          const springForce = -waveHeights[i] * springTension;
          waveVelocities[i] += springForce * simulationStep;
          waveVelocities[i] *= Math.pow(velocityDamping, simulationStep);
          waveHeights[i] += waveVelocities[i] * simulationStep;
          waveHeights[i] = clamp(waveHeights[i], -maxWaveDisplacement, maxWaveDisplacement);
          waveVelocities[i] = clamp(waveVelocities[i], -maxWaveDisplacement, maxWaveDisplacement);
        }

        for (let pass = 0; pass < 2; pass += 1) {
          leftDeltas.fill(0);
          rightDeltas.fill(0);

          for (let i = 0; i < waveHeights.length; i += 1) {
            if (i > 0) {
              leftDeltas[i] = spread * (waveHeights[i] - waveHeights[i - 1]);
              waveVelocities[i - 1] += leftDeltas[i] * simulationStep;
            }

            if (i < waveHeights.length - 1) {
              rightDeltas[i] = spread * (waveHeights[i] - waveHeights[i + 1]);
              waveVelocities[i + 1] += rightDeltas[i] * simulationStep;
            }
          }

          for (let i = 0; i < waveHeights.length; i += 1) {
            if (i > 0) {
              waveHeights[i - 1] += leftDeltas[i] * simulationStep;
            }

            if (i < waveHeights.length - 1) {
              waveHeights[i + 1] += rightDeltas[i] * simulationStep;
            }
          }
        }

        surfaceImpactCooldownRef.current = Math.max(0, surfaceImpactCooldownRef.current - delta);

        const nearSurface = Math.abs(ballCenterY - level) < halfH * 1.2;
        if (nearSurface && (!wasBallNearSurfaceRef.current || surfaceImpactCooldownRef.current <= 0)) {
          const xRatio = clamp(ball.position.x / width, 0, 1);
          const impactIndex = Math.round(xRatio * (waveHeights.length - 1));
          const normalizedDepth = clamp((ballBottom - level) / Math.max(1, currentHitboxH), 0, 1);
          const speedImpact = clamp(Math.abs(ball.velocity.y), 0.5, 10);
          const direction = ball.velocity.y >= 0 ? 1 : -1;
          const impulse = direction * speedImpact * (0.12 + normalizedDepth * 0.25);

          for (let offset = -2; offset <= 2; offset += 1) {
            const index = impactIndex + offset;
            if (index < 0 || index >= waveVelocities.length) continue;

            const falloff = 1 - Math.abs(offset) * 0.28;
            waveVelocities[index] += impulse * falloff;
          }

          surfaceImpactCooldownRef.current = 90;
        }

        wasBallNearSurfaceRef.current = nearSurface;

        if (ballBottom > level - 4) {
          const xRatio = clamp(ball.position.x / width, 0, 1);
          const wakeIndex = Math.round(xRatio * (waveHeights.length - 1));
          const wakeDepth = clamp((ballBottom - level) / Math.max(1, currentHitboxH * 0.9), 0, 1);
          waveVelocities[wakeIndex] += ball.velocity.y * 0.025 * wakeDepth * simulationStep;
        }

        renderWaterSurface();
      }

      // Apply buoyancy force when in water
      if (!isDraggingRef.current) {
        // Define floating equilibrium position (partially submerged)
        const targetSubmersionPx = currentHitboxH * 0.1;
        const floatingEquilibrium = level - (currentHitboxH / 2 - targetSubmersionPx);
        
        if (ballCenterY > level) {
          // Ball center is below water surface - ball is in water
          
          // Check if just entered water
          if (!hasEnteredWaterRef.current) {
            hasEnteredWaterRef.current = true;
          }

          // Calculate depth below water surface
          const depthBelowSurface = ballCenterY - level;
          
          // Buoyancy force increases non-linearly with depth (pool float behavior)
          // The deeper it goes, the stronger the upward force
          const normalizedDepth = depthBelowSurface / Math.max(1, currentHitboxH * 0.5);
          const buoyancyMultiplier = Math.pow(normalizedDepth, 1.5); // Power of 1.5 for progressive increase
          
          // Moderate buoyancy force that increases with depth
          const baseBuoyancy = 0.02;
          const additionalBuoyancy = buoyancyMultiplier * 0.026;
          const buoyancyForce = baseBuoyancy + additionalBuoyancy;
          
          // Apply upward buoyancy force
          Matter.Body.applyForce(ball, ball.position, {
            x: 0,
            y: -buoyancyForce
          });

          // Apply water resistance - more damping to slow down rise
          const distanceFromEquilibrium = Math.abs(ballCenterY - floatingEquilibrium);
          
          if (distanceFromEquilibrium > 5 || Math.abs(ball.velocity.y) > 0.5) {
            // Apply moderate damping when moving through water
            // More damping on upward motion to control rise speed
            if (ball.velocity.y > 0) {
              // Moving down - moderate resistance
              Matter.Body.setVelocity(ball, {
                  x: ball.velocity.x * 0.92,
                  y: ball.velocity.y * 0.92
                });
              } else {
                // Moving up - more resistance to slow the rise
                Matter.Body.setVelocity(ball, {
                  x: ball.velocity.x * 0.91,
                  y: ball.velocity.y * 0.91
                });
              }
          } else {
            // At equilibrium - add gentle bobbing
            bobTimeRef.current += 0.02;
            const bobForce = Math.sin(bobTimeRef.current) * 0.00008;
            Matter.Body.applyForce(ball, ball.position, {
              x: 0,
              y: bobForce
            });
          }
        } else if (ballBottom > level) {
          // Ball is partially in water (top above, bottom below water line)
          hasEnteredWaterRef.current = true;
          
          // Calculate partial submersion
          const submergedHeight = ballBottom - level;
          const submersionRatio = submergedHeight / Math.max(1, currentHitboxH);
          
          // Apply strong proportional buoyancy for partial submersion
          const partialBuoyancy = submersionRatio * 0.03;
          
          Matter.Body.applyForce(ball, ball.position, {
            x: 0,
            y: -partialBuoyancy
          });
          
          // Light air resistance above water
          Matter.Body.setVelocity(ball, {
            x: ball.velocity.x * 0.985,
            y: ball.velocity.y * 0.985
          });
        } else {
          // Ball is completely above water - only air resistance
          hasEnteredWaterRef.current = false;
          
          // Very light air resistance
          Matter.Body.setVelocity(ball, {
            x: ball.velocity.x * 0.995,
            y: ball.velocity.y * 0.995
          });
        }
      }

      const minX = halfW;
      const maxX = width - halfW;
      const minY = halfH;
      const maxY = height - halfH;
      const clampedX = clamp(ball.position.x, minX, maxX);
      const clampedY = clamp(ball.position.y, minY, maxY);

      if (clampedX !== ball.position.x || clampedY !== ball.position.y) {
        Matter.Body.setPosition(ball, { x: clampedX, y: clampedY });

        let nextVelX = ball.velocity.x;
        let nextVelY = ball.velocity.y;

        if ((clampedX <= minX + 0.01 && nextVelX < 0) || (clampedX >= maxX - 0.01 && nextVelX > 0)) {
          nextVelX = -nextVelX * 0.35;
        }

        if ((clampedY <= minY + 0.01 && nextVelY < 0) || (clampedY >= maxY - 0.01 && nextVelY > 0)) {
          nextVelY = -nextVelY * 0.35;
        }

        Matter.Body.setVelocity(ball, { x: nextVelX, y: nextVelY });
      }

      tiltVelocityRef.current += (ball.velocity.x - tiltVelocityRef.current) * Math.min(1, 0.1 * simulationStep);
      const tiltVelocity = Math.abs(tiltVelocityRef.current) < 0.08 ? 0 : tiltVelocityRef.current;
      const targetTiltDeg = clamp(tiltVelocity * 8, -20, 20);
      visualTiltDegRef.current += (targetTiltDeg - visualTiltDegRef.current) * Math.min(1, 0.15 * simulationStep);
      if (tiltVelocity === 0 && Math.abs(visualTiltDegRef.current) < 0.2) {
        visualTiltDegRef.current = 0;
      }

      const duckTop = ball.position.y - duckVisualH / 2;
      const duckBottom = ball.position.y + duckVisualH / 2;
      const targetWetRatio = clamp((duckBottom - level) / duckVisualH, 0, 1);
      wetRatioRef.current += (targetWetRatio - wetRatioRef.current) * Math.min(1, 0.2 * simulationStep);

      if (duckWetOverlayRef.current) {
        const wetRatio = wetRatioRef.current;
        const topInset = `${(1 - wetRatio) * 100}%`;
        duckWetOverlayRef.current.style.clipPath = `inset(${topInset} 0 0 0)`;
        duckWetOverlayRef.current.style.opacity = wetRatio > 0.01 ? `${0.1 + wetRatio * 0.28}` : '0';
      }

      if (ballElRef.current) {
        const dragScale = isDraggingRef.current ? 1.05 : 1;
        ballElRef.current.style.left = `${ball.position.x}px`;
        ballElRef.current.style.top = `${ball.position.y}px`;
        ballElRef.current.style.width = `${duckVisualW}px`;
        ballElRef.current.style.height = `${duckVisualH}px`;
        ballElRef.current.style.transform = `translate(-50%, -50%) rotate(${visualTiltDegRef.current}deg) scale(${dragScale})`;
      }

      if (hitboxElRef.current) {
        hitboxElRef.current.style.width = `${currentHitboxW}px`;
        hitboxElRef.current.style.height = `${currentHitboxH}px`;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = null;
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div className="win95-desktop">
      <Window
        title="Mallard"
        width={contentWidth}
        className="wp-window-frame"
        contentClassName="wp-window-content relative flex flex-col items-center gap-2"
        contentStyle={{ padding: `${contentPadding}px` }}
      >
        {/* Instructions */}
        <div
          className="win95-panel wp-instructions-panel w-full flex flex-wrap items-center justify-between gap-2"
          style={{ minHeight: `${headerPanelHeight}px` }}
        >
          <div>
            <p className="font-bold">Mallard: Anas platyrhynchos</p>
            <p className="win95-subtitle">The ducks bobbed up and down in the water, mirroring their rubber counterparts. Click, drag and release the Mallard.</p>
          </div>
        </div>

        <div className="absolute top-2 right-2 win95-border-raised bg-[#c0c0c0] px-2 py-1 text-[11px] debug-only">
          {containerWidth} x {containerHeight}
        </div>

        {/* Water container */}
        <div
          ref={containerRef}
          className="wp-sim-container relative win95-border-sunken overflow-hidden touch-none"
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
          }}
        >
        <img
          src={mallardBackground}
          alt="Mallard background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
          style={{ zIndex: 0 }}
        />

        {/* Dynamic water surface */}
        <svg
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${waterLevel - waveBaseline}px`,
            height: `${waterFillHeight}px`
          }}
          width={containerWidth}
          height={waterFillHeight}
          viewBox={`0 0 ${containerWidth} ${waterFillHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path ref={waterSurfaceFillPathRef} fill="#7aa6d9" d="" />
          <path
            ref={waterSurfaceLinePathRef}
            fill="none"
            stroke="#e8f0ff"
            strokeWidth="2"
            strokeLinecap="round"
            d=""
          />
        </svg>

        {/* Ball (rendered by Matter.js position) */}
        <div
          ref={ballElRef}
          className={`absolute ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            left: `${containerWidth / 2}px`,
            top: `${initialBallY}px`,
            width: `${duckVisualW}px`,
            height: `${duckVisualH}px`,
            transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
            willChange: 'transform',
          }}
        >
          <div
            ref={hitboxElRef}
            className="absolute pointer-events-none debug-only"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              border: '2px solid rgba(239, 68, 68, 0.85)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }}
          />
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${duckVisualW}px`,
              height: `${duckVisualH}px`,
            }}
          >
            <img
              src={duckSrc}
              alt="Floating duck"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{ backgroundColor: 'transparent', opacity: duckReady ? 1 : 0 }}
              loading="eager"
              decoding="sync"
              draggable={false}
              onLoad={() => setDuckReady(true)}
              onError={() => {
                if (duckSrc !== duckImageFallback) {
                  triedFallbackRef.current = true;
                  setDuckSrc(duckImageFallback);
                } else {
                  setDuckReady(true);
                }
              }}
            />
            <div
              ref={duckWetOverlayRef}
              className="absolute inset-0 bg-blue-400/70 pointer-events-none"
              style={{
                clipPath: 'inset(100% 0 0 0)',
                opacity: 0,
                mixBlendMode: 'multiply',
                maskImage: `url(${duckSrc})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(${duckSrc})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
          </div>

          {!duckReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none z-20">
              <div className="win95-panel flex items-center gap-2 px-3 py-2">
                <img src={loadingGif} alt="Loading" className="w-5 h-5" draggable={false} />
                <span>Loading duck...</span>
              </div>
            </div>
          )}
          </div>
        </div>
      </Window>
    </div>
  );
}
