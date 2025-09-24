"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePageClient() {
  return (
    <main className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-br from-pink-50 via-white to-yellow-50">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight max-w-4xl"
        >
          Taste the <span className="text-pink-600">Goodness</span> of Fahari
          Yoghurt
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl"
        >
          Creamy. Natural. Delicious. Discover yoghurt made with love and the
          freshest ingredients.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex gap-4"
        >
          <Link
            href="/products-page"
            className="px-6 py-3 rounded-2xl bg-pink-600 text-white font-medium shadow hover:bg-pink-700 transition"
          >
            Shop Now
          </Link>
          <Link
            href="/about-page"
            className="px-6 py-3 rounded-2xl border border-pink-600 text-pink-600 font-medium hover:bg-pink-50 transition"
          >
            Learn More
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12"
        >
          <Image
            src="/hero-yoghurt.jpg"
            alt="Fahari Yoghurt"
            width={600}
            height={400}
            className="rounded-2xl shadow-lg"
            priority
          />
        </motion.div>
      </section>

      {/* PRODUCT TEASERS */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
          Our Popular Flavors
        </h2>
        <p className="text-center text-gray-600 mt-2 mb-12">
          Pick your favorite – or try them all.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[{ name: "Vanilla Bliss", img: "/vanilla.jpg" },
            { name: "Strawberry Swirl", img: "/strawberry.jpg" },
            { name: "Mango Delight", img: "/mango.jpg" }]
            .map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-pink-50 rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <Image
                  src={product.img}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <Link
                    href="/products-page"
                    className="mt-4 inline-block text-pink-600 font-medium hover:underline"
                  >
                    View Product →
                  </Link>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-pink-600 text-white py-16 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Ready to Taste the Difference?
        </h2>
        <p className="mt-4 text-lg max-w-2xl mx-auto">
          Order Fahari Yoghurt today and bring the goodness to your home.
        </p>
        <div className="mt-8">
          <Link
            href="/contact-page"
            className="px-8 py-3 rounded-2xl bg-white text-pink-600 font-medium shadow hover:bg-gray-100 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-6 text-center">
        <p>&copy; {new Date().getFullYear()} Fahari Yoghurt. All rights reserved.</p>
      </footer>
    </main>
  );
}
