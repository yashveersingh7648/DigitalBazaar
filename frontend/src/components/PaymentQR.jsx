import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import api, { resolveImageUrl } from "../api/api";
import ImageLightbox from "./ImageLightbox";

// Checkout aur Cart dono me reuse hota hai — QR dikhata hai, UPI ID copy karne deta hai,
// aur customer se UTR / transaction ID lekar payment object return karta hai.
export default function PaymentQR({ amount, method, setMethod, transactionId, setTransactionId }) {
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    api.get("/settings/payment").then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  const copyUpi = () => {
    if (!settings?.upiId) return;
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasQrSetup = settings && (settings.qrImage || settings.upiId);
  const qrSrc = settings?.qrImage ? resolveImageUrl(settings.qrImage) : "";

  return (
    <div style={{ margin: "18px 0" }}>
      <label>Payment Method</label>
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="UPI">Pay Online — UPI / QR</option>
        <option value="COD">Cash on Delivery</option>
      </select>

      {method === "UPI" && (
        hasQrSetup ? (
          <div className="qr-box">
            {qrSrc && (
              <>
                <div className="qr-image-frame" onClick={() => setZoomed(true)}>
                  <img src={qrSrc} alt="Payment QR code" />
                </div>
                <p className="qr-tap-hint">Tap the QR to view full-screen if it won't scan from here</p>
              </>
            )}
            {settings.upiId && (
              <div className="qr-upi-row">
                <span>{settings.payeeName ? `${settings.payeeName} · ` : ""}{settings.upiId}</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={copyUpi}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            )}
            <p className="upload-hint" style={{ margin: "10px 0" }}>
              Scan the QR or pay ₹{amount} to the UPI ID above, then enter the transaction / UTR number below.
            </p>
            <label>Transaction ID / UTR Number</label>
            <input
              className="form-input"
              placeholder="e.g. 12-digit UTR from your payment app"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </div>
        ) : (
          <p className="error-text">Payment QR abhi set up nahi hui hai — Cash on Delivery choose karein, ya seller se contact karein.</p>
        )
      )}

      {zoomed && qrSrc && (
        <ImageLightbox images={[qrSrc]} alt="Payment QR code" onClose={() => setZoomed(false)} />
      )}
    </div>
  );
}
