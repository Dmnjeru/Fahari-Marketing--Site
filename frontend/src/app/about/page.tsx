// src/app/about-page.tsx
"use client";

import React from "react";
import Image from "next/image";

const AboutPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-gradient-to-r from-green-500 to-yellow-400">
        <div className="absolute inset-0">
          <Image
            src="/images/about-hero.jpg"
            alt="Fahari Yoghurt farm and production"
            fill
            priority
            className="object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            About Fahari Yoghurt
          </h1>
          <p className="mt-4 text-lg text-white font-medium">
            Nourishing families with natural, delicious, and wholesome yoghurt.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 md:px-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At <span className="font-semibold">Fahari Yoghurt</span>, our mission
            is to create high-quality, nutritious yoghurt that supports local
            communities while bringing joy to families across Kenya and beyond.
          </p>
          <h2 className="text-3xl font-bold mt-12 mb-6">Our Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            To be a leading yoghurt brand in Africa, known for innovation,
            sustainability, and authenticity — always prioritizing health and
            happiness in every spoonful.
          </p>
        </div>
        <div className="relative w-full h-96">
          <Image
            src="/images/mission-vision.jpg"
            alt="Our mission and vision"
            fill
            className="object-cover rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-gray-50 py-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Story</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Born from a passion for wholesome nutrition, Fahari Yoghurt started
            as a small family initiative to bring naturally fermented yoghurt to
            the community. With a commitment to quality and sustainability, we’ve
            grown into a trusted brand that blends tradition with innovation.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {[
            {
              title: "Quality",
              desc: "Only the best natural ingredients, carefully sourced and prepared.",
            },
            {
              title: "Community",
              desc: "Supporting local farmers and creating opportunities in our region.",
            },
            {
              title: "Sustainability",
              desc: "Eco-friendly practices to protect our environment for future generations.",
            },
            {
              title: "Innovation",
              desc: "Always evolving to create new flavors and healthier options.",
            },
            {
              title: "Trust",
              desc: "A brand families can rely on for consistency and integrity.",
            },
            {
              title: "Health",
              desc: "Products designed to nourish the body and mind.",
            },
          ].map((value, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-green-500 to-yellow-400 py-20 text-center text-white">
        <h2 className="text-4xl font-bold mb-6">Join Our Journey</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Be part of the Fahari family. Discover our yoghurt products and share
          the joy of healthy living.
        </p>
        <a
          href="/products-page"
          className="inline-block px-8 py-4 bg-white text-green-600 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
        >
          Explore Our Products
        </a>
      </section>
    </main>
  );
};

export default AboutPage;
