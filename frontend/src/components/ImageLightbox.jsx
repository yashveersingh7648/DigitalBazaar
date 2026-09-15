import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";

// Flipkart jaisa full-page image viewer: scroll/pinch se zoom, drag karke pan (left/right/top/bottom)
export default function ImageLightbox({ src, alt, onClose }) {
  const [scale, setScale] = useState(1.6);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const clampScale = (s) => Math.min(4, Math.max(1, s));

  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => clampScale(s - e.deltaY * 0.0015));
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, origX: pos.x, origY: pos.y };
    setDragging(true);
  };
  const moveDrag = (clientX, clientY) => {
    if (!dragRef.current.dragging) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };
  const endDrag = () => {
    dragRef.current.dragging = false;
    setDragging(false);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>

      <div
        className={`lightbox-stage ${dragging ? "dragging" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={endDrag}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
        />
      </div>

      <div className="lightbox-zoom-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setScale((s) => clampScale(s - 0.4))} aria-label="Zoom out"><Minus size={16} /></button>
        <button onClick={() => setScale((s) => clampScale(s + 0.4))} aria-label="Zoom in"><Plus size={16} /></button>
      </div>

      <div className="lightbox-hint">Scroll or pinch to zoom · Drag to move around</div>
    </div>
  );
}
