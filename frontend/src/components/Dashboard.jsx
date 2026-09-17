import React, { useState, useEffect } from "react";
import api from "../api/api";
import SEO from "./SEO";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const fetchData = async () => {
    const [d, o, m, a] = await Promise.all([
      api.get("/dashboard"),
      api.get("/orders"),
      api.get("/contact"),
      api.get("/analytics/summary"),
    ]);
    setData(d.data);
    setOrders(o.data);
    setMessages(m.data);
    setAnalytics(a.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchData();
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    await api.put(`/orders/${id}/payment-status`, { paymentStatus });
    fetchData();
  };

  if (!data) return <p style={{ padding: 24 }}>Loading...</p>;
  const { reseller, affiliate } = data;

  return (
    <div className="page container">
      <SEO title="Dashboard" path="/dashboard" noindex />

      {analytics && (
        <>
          <h2 style={{ marginTop: 32 }}>Site Visitors</h2>
          <div className="stat-row">
            <Stat label="Total Visitors" value={analytics.totalVisitors} highlight />
            <Stat label="Active Last 24h" value={analytics.last24h} />
            <Stat label="Active Last 7 Days" value={analytics.last7d} />
            <Stat label="Avg. Time on Site" value={formatDuration(analytics.avgSeconds)} accent />
            <Stat label="Total Pageviews" value={analytics.totalPageviews} />
          </div>
          {analytics.recentSessions.length > 0 && (
            <div className="table-wrap" style={{ marginBottom: 32 }}>
              <table>
                <thead>
                  <tr><th>Visitor</th><th>Pages Viewed</th><th>Time on Site</th><th>Last Page</th><th>Last Active</th></tr>
                </thead>
                <tbody>
                  {analytics.recentSessions.map((s) => (
                    <tr key={s.sessionId}>
                      <td>{s.sessionId}…</td>
                      <td>{s.pageCount}</td>
                      <td>{formatDuration(s.durationSeconds)}</td>
                      <td>{s.lastPath}</td>
                      <td>{new Date(s.lastSeen).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <h2>Reseller Business</h2>
      <div className="stat-row">
        <Stat label="Total Orders" value={reseller.totalOrders} />
        <Stat label="Total Sales" value={`₹${reseller.totalSales}`} />
        <Stat label="Product Cost" value={`₹${reseller.totalCost}`} />
        <Stat label="Gross Margin" value={`₹${reseller.totalMargin}`} highlight />
      </div>

      <h3 className="section-title">Recent Orders</h3>
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th><th>Customer</th><th>Qty</th><th>Paid ₹</th><th>Margin ₹</th><th>Payment</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.productName}</td>
              <td>{o.customerName} ({o.customerPhone})</td>
              <td>{o.quantity}</td>
              <td>{o.totalPaid}</td>
              <td>{o.totalMargin}</td>
              <td>
                {o.paymentMethod === "COD" ? (
                  <span className="badge badge-reseller">COD</span>
                ) : o.paymentStatus === "verified" ? (
                  <span className="badge" style={{ background: "var(--blue-soft)", color: "var(--blue-bright)" }}>Verified</span>
                ) : (
                  <button
                    className="btn btn-outline btn-sm"
                    title={o.transactionId ? `UTR: ${o.transactionId}` : "No UTR submitted"}
                    onClick={() => updatePaymentStatus(o._id, "verified")}
                  >
                    Verify UTR
                  </button>
                )}
              </td>
              <td>
                <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <h2>Affiliate Business</h2>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        Actual commission figures are available on your Flipkart Affiliate dashboard —
        here we only track clicks, so you can see which products are getting the most interest.
      </p>
      <div className="stat-row">
        <Stat label="Total Affiliate Clicks" value={affiliate.totalAffiliateClicks} accent />
      </div>

      <h3 className="section-title">Top Affiliate Products</h3>
      <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Product</th><th>Source</th><th>Clicks</th></tr>
        </thead>
        <tbody>
          {affiliate.topProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.source}</td>
              <td>{p.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <h3 className="section-title">Contact Queries</h3>
      {messages.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No contact messages yet.</p>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr><th>From</th><th>Message</th><th>Emailed?</th><th>Received</th></tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m._id}>
                <td>{m.name}<br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{m.email}{m.phone ? ` · ${m.phone}` : ""}</span></td>
                <td style={{ maxWidth: 320 }}>{m.message}</td>
                <td>{m.emailSent ? "✅" : "—"}</td>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds || seconds < 60) return `${seconds || 0}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function Stat({ label, value, highlight, accent }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""} ${accent ? "accent" : ""}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
