"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mission, AssemblyPart } from "@/data/missions";

interface AssemblyModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BP = {
  bg: "#050f1e",
  panel: "#061525",
  border: "rgba(0, 200, 255, 0.25)",
  borderBright: "rgba(0, 200, 255, 0.6)",
  text: "#ffffff",
  textDim: "rgba(180, 225, 255, 0.65)",
  accent: "#00d4ff",
  accentDim: "rgba(0, 212, 255, 0.3)",
  grid: "rgba(255, 255, 255, 0.045)",
};

interface PlacedPart {
  partId: string;
  x: number;
  y: number;
  snapped: boolean;
}

const SNAP_DISTANCE = 30;
const VIEWPORT_W = 500;
const VIEWPORT_H = 360;
const CENTER_X = VIEWPORT_W / 2;
const CENTER_Y = VIEWPORT_H / 2;

export default function AssemblyModal({ mission, isOpen, onClose, onComplete }: AssemblyModalProps) {
  const parts = mission?.assemblyParts;
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [dragPart, setDragPart] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [assemblyComplete, setAssemblyComplete] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [comResult, setComResult] = useState<{ offset: number; pass: boolean } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens with a new mission
  useEffect(() => {
    if (isOpen && parts) {
      setPlacedParts([]);
      setAssemblyComplete(false);
      setCollapsing(false);
      setComResult(null);
    }
  }, [isOpen, mission?.id]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, partId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Check if already placed & snapped — can't move it
      const existing = placedParts.find(p => p.partId === partId);
      if (existing?.snapped) return;

      setDragPart(partId);
      setDragOffset({ x: 0, y: 0 });
      setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [placedParts]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragPart || !viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [dragPart]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragPart || !parts) { setDragPart(null); return; }

    const part = parts.find(p => p.id === dragPart);
    if (!part) { setDragPart(null); return; }

    // Check if near snap target
    const targetX = CENTER_X + part.targetX;
    const targetY = CENTER_Y + part.targetY;
    const dx = dragPos.x - targetX;
    const dy = dragPos.y - targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const snapped = dist < SNAP_DISTANCE;

    setPlacedParts(prev => {
      const filtered = prev.filter(p => p.partId !== dragPart);
      return [
        ...filtered,
        {
          partId: dragPart,
          x: snapped ? targetX : dragPos.x,
          y: snapped ? targetY : dragPos.y,
          snapped,
        },
      ];
    });

    setDragPart(null);

    // Check if all parts are snapped
    setTimeout(() => {
      setPlacedParts(current => {
        if (!parts) return current;
        const allSnapped = parts.every(p =>
          current.some(placed => placed.partId === p.id && placed.snapped)
        );
        if (allSnapped && !assemblyComplete) {
          checkCenterOfMass(current, parts);
        }
        return current;
      });
    }, 100);
  }, [dragPart, dragPos, parts, assemblyComplete]);

  const checkCenterOfMass = (placed: PlacedPart[], partsList: AssemblyPart[]) => {
    // Calculate center of mass
    let totalMass = 0;
    let comX = 0;
    let comY = 0;

    for (const p of placed) {
      const partData = partsList.find(pd => pd.id === p.partId);
      if (!partData) continue;
      totalMass += partData.mass;
      comX += p.x * partData.mass;
      comY += p.y * partData.mass;
    }

    comX /= totalMass;
    comY /= totalMass;

    // Target CoM is roughly center
    const idealX = CENTER_X;
    const idealY = CENTER_Y;
    const offset = Math.sqrt((comX - idealX) ** 2 + (comY - idealY) ** 2);

    // Since parts snap to correct positions, CoM should always be balanced
    // But we still show the analysis for educational effect
    const pass = offset < 60;

    setComResult({ offset: Math.round(offset), pass });

    if (pass) {
      setAssemblyComplete(true);
      setTimeout(() => onComplete(), 500);
    } else {
      // Collapse animation
      setCollapsing(true);
      setTimeout(() => {
        setCollapsing(false);
        setPlacedParts([]);
        setComResult(null);
      }, 1500);
    }
  };

  if (!isOpen || !mission || !parts) return null;

  const unplacedParts = parts.filter(
    p => !placedParts.some(pp => pp.partId === p.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="asm-backdrop"
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(2, 8, 22, 0.95)",
              backdropFilter: "blur(12px)",
              backgroundImage: `linear-gradient(${BP.grid} 1px, transparent 1px), linear-gradient(90deg, ${BP.grid} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="asm-modal"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: BP.panel, border: `1px solid ${BP.border}` }}
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: BP.bg, borderBottom: `1px solid ${BP.border}` }}>
                <span className="text-3xl">{mission.emoji}</span>
                <div>
                  <h2 className="text-lg font-headline font-black" style={{ color: BP.text }}>
                    Assembly Mode: {mission.title}
                  </h2>
                  <p className="text-[10px] font-label uppercase tracking-widest" style={{ color: BP.textDim }}>
                    Drag parts onto the blueprint · Balance the center of mass
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: BP.accentDim, border: `1px solid ${BP.border}`, color: BP.accent }}
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Assembly Viewport */}
                <div
                  ref={viewportRef}
                  className="relative cursor-crosshair select-none"
                  style={{
                    width: VIEWPORT_W,
                    height: VIEWPORT_H,
                    background: BP.bg,
                    backgroundImage: `linear-gradient(rgba(0,200,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.06) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    borderRight: `1px solid ${BP.border}`,
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Blueprint ghost targets */}
                  {parts.map(part => (
                    <div
                      key={`ghost-${part.id}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: CENTER_X + part.targetX - part.width / 2,
                        top: CENTER_Y + part.targetY - part.height / 2,
                        width: part.width,
                        height: part.height,
                        border: "2px dashed rgba(0,200,255,0.3)",
                        borderRadius: part.shape === "circle" ? "50%" : "4px",
                        transform: part.targetAngle ? `rotate(${part.targetAngle}deg)` : undefined,
                      }}
                    >
                      <div className="absolute -top-4 left-0 text-[7px] font-label whitespace-nowrap" style={{ color: "rgba(0,200,255,0.4)" }}>
                        {part.label}
                      </div>
                    </div>
                  ))}

                  {/* Placed parts */}
                  {placedParts.map(placed => {
                    const partData = parts.find(p => p.id === placed.partId);
                    if (!partData) return null;
                    return (
                      <motion.div
                        key={`placed-${placed.partId}`}
                        className="absolute cursor-grab active:cursor-grabbing"
                        style={{
                          left: placed.x - partData.width / 2,
                          top: placed.y - partData.height / 2,
                          width: partData.width,
                          height: partData.height,
                          background: partData.color,
                          borderRadius: partData.shape === "circle" ? "50%" : "4px",
                          border: placed.snapped ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.3)",
                          boxShadow: placed.snapped ? "0 0 10px rgba(34,197,94,0.5)" : "0 2px 8px rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "7px",
                          fontWeight: "bold",
                          color: "white",
                          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                          opacity: collapsing ? undefined : 1,
                          zIndex: 5,
                        }}
                        animate={collapsing ? {
                          y: [0, 100 + Math.random() * 100],
                          rotate: [0, (Math.random() - 0.5) * 180],
                          opacity: [1, 0],
                        } : placed.snapped ? {
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={collapsing ? { duration: 1, ease: "easeIn" } : { duration: 0.3 }}
                        onMouseDown={e => handleMouseDown(e, placed.partId)}
                      >
                        <span className="font-label text-[7px] leading-none text-center px-1">{partData.label}</span>
                      </motion.div>
                    );
                  })}

                  {/* Currently dragging part */}
                  {dragPart && (() => {
                    const partData = parts.find(p => p.id === dragPart);
                    if (!partData) return null;
                    return (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          left: dragPos.x - partData.width / 2,
                          top: dragPos.y - partData.height / 2,
                          width: partData.width,
                          height: partData.height,
                          background: partData.color,
                          borderRadius: partData.shape === "circle" ? "50%" : "4px",
                          border: "2px solid rgba(0,212,255,0.8)",
                          boxShadow: "0 0 20px rgba(0,212,255,0.4)",
                          opacity: 0.85,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "7px",
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        <span className="font-label text-[7px]">{partData.label}</span>
                      </div>
                    );
                  })()}

                  {/* CoM result overlay */}
                  {comResult && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center z-30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div
                        className="px-6 py-4 rounded-xl text-center font-headline font-bold"
                        style={{
                          background: comResult.pass ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)",
                          border: `2px solid ${comResult.pass ? "#22c55e" : "#ef4444"}`,
                          color: "white",
                          boxShadow: comResult.pass ? "0 0 30px rgba(34,197,94,0.5)" : "0 0 30px rgba(239,68,68,0.5)",
                        }}
                      >
                        {comResult.pass ? (
                          <>
                            <div className="text-2xl mb-1">✅ Assembly Verified!</div>
                            <div className="text-sm opacity-80">
                              Center of mass offset: {comResult.offset}px — WITHIN TOLERANCE
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl mb-1">⚠️ Structural Failure!</div>
                            <div className="text-sm opacity-80">
                              CoM offset: {comResult.offset}px — Assembly collapsed. Try again.
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Assembly complete overlay */}
                  {assemblyComplete && (
                    <motion.div
                      className="absolute inset-0 z-20 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ background: "rgba(34,197,94,0.08)" }}
                    />
                  )}
                </div>

                {/* Parts Bin */}
                <div className="flex-1 p-4 space-y-3" style={{ minWidth: 180 }}>
                  <div className="text-[10px] font-label uppercase tracking-widest font-bold" style={{ color: BP.textDim }}>
                    🧩 Parts Bin
                  </div>

                  {unplacedParts.length === 0 && !assemblyComplete && (
                    <p className="text-[10px] font-label" style={{ color: BP.textDim }}>
                      All parts placed! Checking mechanical integrity...
                    </p>
                  )}

                  {unplacedParts.map(part => (
                    <motion.div
                      key={part.id}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${BP.border}`,
                      }}
                      whileHover={{ scale: 1.02, borderColor: BP.accent }}
                      onMouseDown={e => {
                        if (!viewportRef.current) return;
                        setDragPart(part.id);
                        setDragPos({ x: CENTER_X, y: CENTER_Y });
                      }}
                    >
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: Math.min(40, part.width * 0.5),
                          height: Math.min(30, part.height * 0.5),
                          background: part.color,
                          borderRadius: part.shape === "circle" ? "50%" : "3px",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      />
                      <div>
                        <div className="text-xs font-label font-bold" style={{ color: BP.text }}>{part.label}</div>
                        <div className="text-[8px] font-label" style={{ color: BP.textDim }}>
                          {part.mass}kg · {part.shape}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Mass legend */}
                  <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${BP.border}` }}>
                    <div className="text-[8px] font-label uppercase tracking-wider mb-2" style={{ color: BP.textDim }}>
                      📐 Engineering Data
                    </div>
                    <div className="space-y-1">
                      {parts.map(p => (
                        <div key={p.id} className="flex justify-between text-[9px] font-label" style={{ color: "rgba(180,220,255,0.6)" }}>
                          <span>{p.label}</span>
                          <span>{p.mass} kg</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 text-[9px] font-label font-bold" style={{ borderTop: `1px solid ${BP.border}`, color: BP.accent }}>
                      Total mass: {parts.reduce((s, p) => s + p.mass, 0)} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 text-center" style={{ borderTop: `1px solid ${BP.border}` }}>
                <span className="text-[10px] font-label uppercase tracking-widest" style={{ color: BP.textDim }}>
                  Drag parts from the bin onto their blueprint targets · Press <kbd className="px-1.5 py-0.5 rounded font-bold mx-0.5" style={{ background: BP.accentDim, color: BP.accent, border: `1px solid ${BP.border}` }}>ESC</kbd> to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
