// src/app/terms-page.tsx
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions – Fahari Yoghurt",
  description:
    "Read Fahari Yoghurt’s terms and conditions to understand your rights and obligations when using our website and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>

        <section className="space-y-6">
          <p>
            Welcome to Fahari Yoghurt. By using our website or services, you agree to the following terms and conditions. Please read them carefully.
          </p>

          <h2 className="text-2xl font-semibold mt-6">1. Use of Our Website</h2>
          <p>
            You may use our website for lawful purposes only. Unauthorized use of our website may give rise to a claim for damages or be a criminal offense.
          </p>

          <h2 className="text-2xl font-semibold mt-6">2. Orders and Payments</h2>
          <p>
            All orders are subject to availability. We reserve the right to cancel or refuse any order for any reason. Prices and promotions may change without notice. Payment must be completed through the approved payment methods.
          </p>

          <h2 className="text-2xl font-semibold mt-6">3. Delivery</h2>
          <p>
            Delivery times are estimates and not guaranteed. Fahari Yoghurt is not responsible for delays caused by third-party delivery services or circumstances beyond our control.
          </p>

          <h2 className="text-2xl font-semibold mt-6">4. Returns and Refunds</h2>
          <p>
            Returns or refunds are only accepted in accordance with our Return Policy. Please contact customer support for assistance with any issues related to your order.
          </p>

          <h2 className="text-2xl font-semibold mt-6">5. Intellectual Property</h2>
          <p>
            All content on this website, including text, images, logos, and designs, is the property of Fahari Yoghurt or its licensors. You may not reproduce or use any content without written permission.
          </p>

          <h2 className="text-2xl font-semibold mt-6">6. Limitation of Liability</h2>
          <p>
            Fahari Yoghurt is not liable for any indirect, incidental, or consequential damages arising from the use of our website or services. Our maximum liability is limited to the amount you paid for the product or service in question.
          </p>

          <h2 className="text-2xl font-semibold mt-6">7. Privacy</h2>
          <p>
            By using our services, you consent to the collection and use of your information in accordance with our Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-6">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Any changes will be posted on this page with an updated effective date. Continued use of the website constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-2xl font-semibold mt-6">9. Governing Law</h2>
          <p>
            These terms and conditions are governed by the laws of Kenya. Any disputes arising from these terms shall be subject to the jurisdiction of Kenyan courts.
          </p>

          <h2 className="text-2xl font-semibold mt-6">Contact</h2>
          <p>
            If you have questions regarding these Terms & Conditions, please contact us at
            <a href="mailto:info@faharidairies.co.ke" className="text-emerald-600 hover:underline"> info@faharidairies.co.ke</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
