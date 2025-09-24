// src/app/faq-page.tsx
"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is Fahari Yoghurt made from?",
    answer:
      "Fahari Yoghurt is made from 100% fresh farm milk, natural live cultures, and carefully selected ingredients to ensure a creamy, healthy, and delicious taste.",
  },
  {
    question: "Do you offer home delivery?",
    answer:
      "Yes! We provide convenient home delivery within Nairobi and surrounding areas. Orders can be placed online, and our drivers deliver directly to your doorstep.",
  },
  {
    question: "Is Fahari Yoghurt suitable for children?",
    answer:
      "Absolutely. Our yoghurt is a healthy snack option for children, packed with calcium, protein, and probiotics that support growth and digestion.",
  },
  {
    question: "What flavors are available?",
    answer:
      "We offer a variety of flavors including Vanilla, Strawberry, Mango, and Plain Natural. Seasonal flavors may also be introduced from time to time.",
  },
  {
    question: "How do I place a bulk or wholesale order?",
    answer:
      "For bulk or wholesale orders, you can contact our sales team via the Contact page or email sales@faharidairies.co.ke. Special pricing is available for retailers and distributors.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-400 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Frequently Asked Questions
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-90">
          Got a question? We’ve got answers. Here are some of the most common
          queries from our customers.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-medium text-gray-900 focus:outline-none"
              >
                {faq.question}
                <span className="ml-4">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
