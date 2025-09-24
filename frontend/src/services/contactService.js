import axiosInstance from "@/lib/axios";

/**
 * @desc Submit contact form data to backend
 * @param {Object} formData - { name, email, phone, message }
 * @returns {Promise<Object>}
 */
export const submitContactForm = async (formData) => {
  const { data } = await axiosInstance.post("/contact", formData);
  return data; // { success, message, data }
};
