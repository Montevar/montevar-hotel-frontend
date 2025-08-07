"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { getApiBaseUrl } from "@/utils/apiConfig";

function PaystackComponent() {
  const params = useSearchParams();

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/bookings/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (data.verified) {
        console.log("✅ Payment verified and booking updated");
      } else {
        console.warn("⚠️ Payment not verified");
      }
    } catch (err) {
      console.error("❌ Error verifying payment", err);
    }
  };

  useEffect(() => {
    const reference = params.get("reference");

    if (reference) {
      verifyPayment(reference);
    } else {
      // Optional: handle redirect setup logic
      const name = params.get("name");
      const email = params.get("email");
      const phone = params.get("phone");
      const amount = params.get("amount");
      const roomId = params.get("roomId");
      const startDate = params.get("startDate");
      const endDate = params.get("endDate");

      console.log("Redirecting to Paystack with:", {
        name,
        email,
        phone,
        amount,
        roomId,
        startDate,
        endDate,
      });
    }
  }, [params]);

  return (
    <div>
      <h1>Processing...</h1>
      <p>
        {params.get("reference")
          ? "Verifying payment, please wait..."
          : "Redirecting to Paystack..."}
      </p>
    </div>
  );
}

export default function PaystackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaystackComponent />
    </Suspense>
  );
}
