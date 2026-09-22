import React, { useState, useRef } from "react";
import { Ruler, Upload, AlertCircle } from "lucide-react";

// Model ko ek baar hi load karte hain aur cache rakhte hain — baar baar "Check My Size"
// click karne par dobara download/load nahi hoga.
let landmarkerPromise = null;
const getLandmarker = async () => {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      });
    })();
  }
  return landmarkerPromise;
};

// BlazePose 33-point landmark indices jo humein chahiye
const L = { NOSE: 0, L_SHOULDER: 11, R_SHOULDER: 12, L_HIP: 23, R_HIP: 24, L_ANKLE: 27, R_ANKLE: 28 };

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Chart me stored sabse kareeb size dhoondta hai (chest ko priority, warna waist, warna shoulder)
function findBestSize(sizeChart, estimate) {
  const key = sizeChart.some((r) => r.chest) ? "chest" : sizeChart.some((r) => r.waist) ? "waist" : "shoulder";
  const target = estimate[key];
  if (target == null) return null;
  let best = null;
  let bestDiff = Infinity;
  for (const row of sizeChart) {
    if (row[key] == null) continue;
    const diff = Math.abs(row[key] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = row;
    }
  }
  return best ? { row: best, matchedOn: key } : null;
}

export default function SizeFitChecker({ sizeChart }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const checkSize = async () => {
    if (!photoFile || !heightCm) {
      setError("Please add a full-body photo and your height.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const landmarker = await getLandmarker();

      const img = new Image();
      img.src = photoPreview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Could not read this image"));
      });

      const detection = landmarker.detect(img);
      const points = detection?.landmarks?.[0];
      if (!points) {
        setError("Couldn't detect a full body in this photo. Try a clear, front-facing, full-body photo with plain background.");
        setLoading(false);
        return;
      }

      const px = (i) => ({ x: points[i].x * img.naturalWidth, y: points[i].y * img.naturalHeight });
      const nose = px(L.NOSE);
      const lShoulder = px(L.L_SHOULDER);
      const rShoulder = px(L.R_SHOULDER);
      const lHip = px(L.L_HIP);
      const rHip = px(L.R_HIP);
      const lAnkle = px(L.L_ANKLE);
      const rAnkle = px(L.R_ANKLE);

      // Nose-se-ankle tak ka pixel span, average adult ke liye ye total height ka ~87% hota hai —
      // isse ek reference scale (cm per pixel) milta hai
      const ankleY = (lAnkle.y + rAnkle.y) / 2;
      const noseToAnklePx = ankleY - nose.y;
      const estimatedTotalHeightPx = noseToAnklePx / 0.87;
      if (estimatedTotalHeightPx <= 0) {
        setError("Couldn't get a clear full-body reading from this photo. Try standing straight, fully visible, facing the camera.");
        setLoading(false);
        return;
      }
      const cmPerPx = Number(heightCm) / estimatedTotalHeightPx;

      const shoulderWidthCm = dist(lShoulder, rShoulder) * cmPerPx;
      const hipWidthCm = dist(lHip, rHip) * cmPerPx;

      // Shoulder/hip ki "breadth" se circumference ka rough andaza — ye ek approximation hai,
      // exact tailor-measurement jaisa accurate nahi hoga
      const estimate = {
        chest: (shoulderWidthCm * 2.5) / 2.54, // cm -> inches
        waist: (hipWidthCm * 2.1) / 2.54,
        shoulder: shoulderWidthCm / 2.54,
      };

      const match = findBestSize(sizeChart, estimate);
      setResult({ estimate, match });
    } catch (err) {
      setError("Something went wrong reading this photo. Please try a different one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fit-checker">
      <div className="fit-checker-head">
        <Ruler size={18} />
        <h4>Check your size from a photo</h4>
      </div>
      <p className="fit-checker-note">
        This is an approximate estimate based on your photo and height — not an exact
        measurement. Your photo is processed entirely in your browser and is never uploaded
        anywhere.
      </p>

      <div className="fit-checker-row">
        <label className="fit-upload" htmlFor="fit-photo-input">
          {photoPreview ? <img src={photoPreview} alt="Your upload" /> : <><Upload size={18} /><span>Full-body photo</span></>}
          <input id="fit-photo-input" ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
        </label>
        <div style={{ flex: 1 }}>
          <label>Your height (cm)</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 170"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
          <button className="btn btn-primary btn-pill" onClick={checkSize} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Analyzing..." : "Check My Size"}
          </button>
        </div>
      </div>

      {error && (
        <p className="error-text" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {result && (
        <div className="fit-result">
          {result.match ? (
            <>
              <div className="fit-result-size">Recommended size: <strong>{result.match.row.size}</strong></div>
              <p className="fit-checker-note" style={{ marginTop: 4 }}>
                Estimated {result.match.matchedOn}: ~{result.estimate[result.match.matchedOn].toFixed(1)}in
              </p>
            </>
          ) : (
            <p className="fit-checker-note">Got your measurements, but this product has no size chart to match against yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
