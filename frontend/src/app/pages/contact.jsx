// frontend/src/pages/Contact.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance"; // ✅ Use baseURL-aware axios instance

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axiosInstance.post("/contact", formData);

      toast.success(data.message || "Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-12 px-6 md:px-20 lg:px-32">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-6">
          Contact Us
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Got a question or feedback? We'd love to hear from you! Fill out the form
          below and we'll get back to you shortly.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 shadow-lg rounded-2xl p-6 md:p-10 space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
