import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";

// Flipkart jaisa full-page image viewer: scroll/pinch se zoom, drag karke pan,
// aur agar product me ek se zyada images hain to left/right se poori gallery scroll kar sakte ho.
export default function ImageLightbox({ images, startIndex = 0, alt, onClose }) {
  const gallery = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);
  const [index, setIndex] = useState(Math.min(startIndex, gallery.length - 1));
  const [scale, setScale] = useState(1.6);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const resetView = () => {
    setScale(1.6);
    setPos({ x: 0, y: 0 });
  };

  const goPrev = () => { setIndex((i) => (i - 1 + gallery.length) % gallery.length); resetView(); };
  const goNext = () => { setIndex((i) => (i + 1) % gallery.length); resetView(); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && gallery.length > 1) goPrev();
      if (e.key === "ArrowRight" && gallery.length > 1) goNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, gallery.length]);

  const clampScale = (s) => Math.min(4, Math.max(1, s));

  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => clampScale(s - e.deltaY * 0.0015));
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, origX: pos.x, origY: pos.y, moved: false };
    setDragging(true);
  };
  const moveDrag = (clientX, clientY) => {
    if (!dragRef.current.dragging) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) dragRef.current.moved = true;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };
  const endDrag = () => {
    // Zoomed-out state (scale ~1) me agar horizontal swipe kiya to agli/pichli image par le jao
    if (scale <= 1.15 && dragRef.current.moved) {
      const dx = pos.x - dragRef.current.origX;
      if (dx > 60 && gallery.length > 1) goPrev();
      else if (dx < -60 && gallery.length > 1) goNext();
      else setPos({ x: 0, y: 0 });
    }
    dragRef.current.dragging = false;
    setDragging(false);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>

      {gallery.length > 1 && (
        <>
          <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous image">
            <ChevronLeft size={22} />
          </button>
          <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next image">
            <ChevronRight size={22} />
          </button>
          <div className="lightbox-counter">{index + 1} / {gallery.length}</div>
        </>
      )}

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
          src={gallery[index]}
          alt={alt}
          draggable={false}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
        />
      </div>

      {gallery.length > 1 && (
        <div className="lightbox-dots" onClick={(e) => e.stopPropagation()}>
          {gallery.map((_, i) => (
            <button
              key={i}
              className={`lightbox-dot ${i === index ? "active" : ""}`}
              onClick={() => { setIndex(i); resetView(); }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="lightbox-zoom-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setScale((s) => clampScale(s - 0.4))} aria-label="Zoom out"><Minus size={16} /></button>
        <button onClick={() => setScale((s) => clampScale(s + 0.4))} aria-label="Zoom in"><Plus size={16} /></button>
      </div>

      <div className="lightbox-hint">
        {gallery.length > 1 ? "Swipe or use arrows to browse · " : ""}Scroll or pinch to zoom · Drag to move
      </div>
    </div>
  );
}
