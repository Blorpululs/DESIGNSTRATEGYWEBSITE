import { useEffect, useMemo, useRef, useState } from "react";
import Window from "./Window";
import warningIcon from "../../assets/images/warning.png";
import honeyLocustImage from "../../assets/images/HONEYLOCUSTlowquality.jpg";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function HoneyLocust() {
  const referenceImageWidth = 3024;
  const referenceImageHeight = 4032;
  const maxContainerWidth = 800;
  const maxContainerHeight = 1200;
  const contentPadding = 12;
  const headerPanelHeight = 56;

  const [containerSize, setContainerSize] = useState({ width: maxContainerWidth, height: maxContainerHeight });
  const [dialogVisible, setDialogVisible] = useState(false);
  const wasInsideHitboxRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  const contentWidth = containerWidth + contentPadding * 2;
  const dialogWidth = Math.max(240, Math.min(280, Math.round(containerWidth * 0.38)));
  const dialogHeight = 118;
  const [dialogPosition, setDialogPosition] = useState({
    left: Math.max(10, Math.round((maxContainerWidth - 260) / 2)),
    top: 10,
  });

  const hitbox = useMemo(() => {
    const hitboxWidthRatio = (227 * 0.8) / 640;
    const hitboxHeightRatio = ((920 * 0.8) / 950) * 1.05;
    const width = containerWidth * hitboxWidthRatio;
    const height = containerHeight * hitboxHeightRatio;
    const rotationDeg = 9.8;
    const scaledX = (containerWidth - width) / 2;
    const topShift = height * 0;
    const scaledY = (containerHeight - height) / 2 + topShift;

    return {
      x: scaledX,
      y: scaledY,
      width,
      height,
      rotationDeg,
      centerX: scaledX + width / 2,
      centerY: scaledY + height / 2,
    };
  }, [containerWidth, containerHeight]);

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

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const isInsideRotatedRect = (x: number, y: number) => {
    const theta = (hitbox.rotationDeg * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const dx = x - hitbox.centerX;
    const dy = y - hitbox.centerY;

    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;

    return Math.abs(localX) <= hitbox.width / 2 && Math.abs(localY) <= hitbox.height / 2;
  };

  const getDialogPositionFromCursor = (clientX: number, clientY: number, simRect: DOMRect) => {
    if (!contentRef.current) {
      return dialogPosition;
    }

    const contentRect = contentRef.current.getBoundingClientRect();
    const margin = 10;
    const offsetX = 14;
    const topOffset = 8;

    const maxLeft = Math.max(margin, contentRect.width - dialogWidth - margin);
    const maxTop = Math.max(margin, contentRect.height - dialogHeight - margin);

    const left = clamp(clientX - contentRect.left + offsetX, margin, maxLeft);

    const aboveTop = simRect.top - contentRect.top - dialogHeight - topOffset;
    const belowTop = simRect.bottom - contentRect.top + topOffset;

    let top = aboveTop >= margin ? aboveTop : belowTop;
    top = clamp(top, margin, maxTop);

    return { left, top };
  };

  const getRelativePointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, containerWidth);
    const y = clamp(e.clientY - rect.top, 0, containerHeight);
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pointer = getRelativePointer(e);
    const insideHitbox = isInsideRotatedRect(pointer.x, pointer.y);

    if (insideHitbox && !wasInsideHitboxRef.current) {
      setDialogPosition(getDialogPositionFromCursor(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()));
      setDialogVisible(true);
    }

    wasInsideHitboxRef.current = insideHitbox;
  };

  return (
    <div className="win95-desktop">
      <Window
        title="Honey Locust"
        width={contentWidth}
        contentClassName="relative"
        contentStyle={{ padding: `${contentPadding}px` }}
      >
        <div ref={contentRef} className="relative w-full flex flex-col items-center gap-2">
          <div className="win95-panel w-full" style={{ minHeight: `${headerPanelHeight}px` }}>
            <p className="font-bold">Honey Locust Tree</p>
            <p className="win95-subtitle">I have never seen a tree that screams "Falling from me would hurt less than climbing me." Watch out for the thorns!</p>
          </div>

          <div
            className="relative win95-border-sunken bg-white overflow-hidden touch-none"
            style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              wasInsideHitboxRef.current = false;
            }}
          >
            <img
              src={honeyLocustImage}
              alt="Honey Locust tree"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />

            <div
              className="absolute pointer-events-none debug-only"
              style={{
                left: `${hitbox.centerX}px`,
                top: `${hitbox.centerY}px`,
                width: `${hitbox.width}px`,
                height: `${hitbox.height}px`,
                border: "2px solid rgba(220, 38, 38, 0.9)",
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                transform: `translate(-50%, -50%) rotate(${hitbox.rotationDeg}deg)`,
                transformOrigin: "center",
              }}
            />
          </div>

          {dialogVisible && (
            <div
              className="absolute win95-window"
              style={{
                width: `${dialogWidth}px`,
                left: `${dialogPosition.left}px`,
                top: `${dialogPosition.top}px`,
                zIndex: 10,
              }}
            >
              <div className="win95-titlebar">
                <div className="win95-titlebar-text">Warning</div>
              </div>
              <div className="win95-window-content">
                <div className="w-full px-2 pt-2">
                  <div className="flex justify-start pl-2">
                    <img
                      src={warningIcon}
                      alt="Warning"
                      width={32}
                      height={32}
                      className="pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                  <p className="m-0 text-center whitespace-nowrap">ouch, that's sharp!</p>
                </div>
                <div className="flex justify-center pb-2">
                  <button
                    type="button"
                    className="win95-button"
                    style={{ minWidth: "92px" }}
                    onClick={() => setDialogVisible(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}
