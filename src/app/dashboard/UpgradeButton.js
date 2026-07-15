"use client";

import { useState } from "react";
import Script from "next/script";

export default function UpgradeButton({ className = "", tier = "pro", children }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      // 1. Create Order
      const res = await fetch("/api/checkout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();

      if (!data.success) {
        alert("Failed to create order: " + (data.error || "Unknown error"));
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: tier === "elite" ? "Kinetic Elite" : "Kinetic Pro",
        description: tier === "elite" ? "Elite A/B Testing Tier" : "21 AI Thumbnail Generations / Week",
        order_id: data.order.id,
        handler: async function (response) {
          // 3. Verify Signature
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: tier
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful! Welcome to Kinetic Pro.");
            window.location.reload(); // Reload to update UI
          } else {
            alert("Payment Verification Failed!");
          }
        },
        prefill: {
          name: "Kinetic User",
          email: "user@example.com",
        },
        theme: {
          color: "#f5d800",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button 
        onClick={handleUpgrade} 
        disabled={loading} 
        className={className || "text-[10px] uppercase tracking-widest font-bold bg-gold text-black py-1.5 px-4 rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"}
      >
        {loading ? "Processing..." : (children || "Upgrade to Pro")}
      </button>
    </>
  );
}
