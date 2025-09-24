// src/app/privacy-policy-page.tsx
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Fahari Yoghurt",
  description:
    "Read Fahari Yoghurt’s privacy policy to understand how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <section className="space-y-6">
          <p>
            Fahari Yoghurt respects your privacy and is committed to protecting your personal information.
            This policy explains how we collect, use, and safeguard your data when you interact with our website
            or services.
          </p>

          <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc list-inside">
            <li>Personal information you provide (name, email, phone, address).</li>
            <li>Order details and preferences when you place purchases.</li>
            <li>Technical data (IP address, browser type, device information).</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside">
            <li>Process and deliver orders.</li>
            <li>Respond to inquiries and provide customer support.</li>
            <li>Improve our products, services, and website experience.</li>
            <li>Send promotional updates (with your consent).</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">3. Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We may share data with trusted service providers for:
          </p>
          <ul className="list-disc list-inside">
            <li>Payment processing and order fulfillment.</li>
            <li>Email communication services.</li>
            <li>Legal or regulatory compliance, if required.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information from unauthorized access,
            disclosure, alteration, or destruction.
          </p>

          <h2 className="text-2xl font-semibold mt-6">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. Contact us at
            <a href="mailto:info@faharidairies.co.ke" className="text-emerald-600 hover:underline"> info@faharidairies.co.ke</a> for requests.
          </p>

          <h2 className="text-2xl font-semibold mt-6">6. Cookies</h2>
          <p>
            We use cookies to enhance website performance, remember preferences, and analyze site traffic.
            You can disable cookies in your browser settings.
          </p>

          <h2 className="text-2xl font-semibold mt-6">7. Changes to this Policy</h2>
          <p>
            We may update this policy periodically. Any changes will be posted on this page with an updated effective date.
          </p>

          <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
          <p>
            For questions about this privacy policy or our practices, please contact us at:
            <br />
            <a href="mailto:info@faharidairies.co.ke" className="text-emerald-600 hover:underline">
              info@faharidairies.co.ke
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
