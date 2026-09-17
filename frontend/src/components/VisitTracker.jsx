import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api, { API_URL } from "../api/api";

const getSessionId = () => {
  let id = localStorage.getItem("visitor_sid");
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("visitor_sid", id);
  }
  return id;
};

// Koi UI nahi render karta — sirf background me pageview + heartbeat bhejta rehta hai,
// taaki Admin Dashboard me visitor count aur "time on site" dikh sake. Koi personal data nahi bhejta.
export default function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const sessionId = getSessionId();
    api.post("/analytics/ping", { sessionId, path: location.pathname, isNewPageview: true }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const sessionId = getSessionId();
    const heartbeat = setInterval(() => {
      if (document.visibilityState === "visible") {
        api.post("/analytics/ping", { sessionId, path: location.pathname, isNewPageview: false }).catch(() => {});
      }
    }, 25000);

    const onUnload = () => {
      // Tab band hone par bhi reliably bhejne ke liye sendBeacon (fetch tab-close par cancel ho sakta hai)
      const payload = JSON.stringify({ sessionId, path: location.pathname, isNewPageview: false });
      navigator.sendBeacon?.(`${API_URL}/analytics/ping`, new Blob([payload], { type: "application/json" }));
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [location.pathname]);

  return null;
}
