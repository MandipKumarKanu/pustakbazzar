import React from "react";
import { toast } from "sonner";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import PrimaryBtn from "@/components/PrimaryBtn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const ContactPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again later.");
      console.error("Contact form error:", error);
    }
  };

  const inputClasses =
    "w-full h-11 rounded-md border border-gray-300 px-4 py-2 text-base outline-none transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent";
  const textareaClasses =
    "w-full rounded-md border border-gray-300 px-4 py-2 text-base outline-none transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none";

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto pt-16 pb-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-3 font-meditative">
          Get in Touch
        </h1>
        <p className="text-center max-w-2xl mx-auto font-sfpro text-threeColor text-lg">
          Have questions or want to learn more? We'd love to hear from you. Our
          team is ready to assist you with any inquiries.
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto border-2 rounded-2xl overflow-hidden">
          <div className="bg-white shadow-xl">
            <div className="flex flex-col md:flex-row">
              <div className="bg-primaryColor text-white p-8 md:p-12 md:w-2/5 relative">
                {/* Left side content - unchanged */}
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primaryColor rounded-full p-2 mr-4">
                      <FaEnvelope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm">Email</p>
                      <a
                        href="mailto:mandipshah3@gmail.com"
                        className="text-lg hover:underline"
                      >
                        mandipshah3@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primaryColor rounded-full p-2 mr-4">
                      <FaPhoneAlt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm">Phone</p>
                      <p className="text-lg">+977 981-120-9589</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primaryColor rounded-full p-2 mr-4">
                      <FaMapMarkerAlt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm">Address</p>
                      <p className="text-lg">Aadarshnagar</p>
                      <p className="text-lg">Birgunj, Nepal</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <p className="mb-3">Connect with us</p>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="bg-primaryColor hover:bg-primaryColor rounded-full p-2 transition duration-300"
                    >
                      <FaFacebook className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="bg-primaryColor hover:bg-primaryColor rounded-full p-2 transition duration-300"
                    >
                      <FaTwitter className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="bg-primaryColor hover:bg-primaryColor rounded-full p-2 transition duration-300"
                    >
                      <FaInstagram className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="bg-primaryColor hover:bg-primaryColor rounded-full p-2 transition duration-300"
                    >
                      <FaLinkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 opacity-10">
                  <svg
                    width="400"
                    height="400"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#FFFFFF"
                      d="M42.7,-65.3C56.4,-57.2,69.3,-47.2,76.9,-33.7C84.5,-20.2,86.6,-3.3,83.2,12.3C79.8,27.9,70.7,42.1,58.6,51.4C46.5,60.7,31.4,64.9,16.3,69.7C1.2,74.6,-13.8,79.9,-28.9,77.5C-44,75.1,-59.1,64.8,-67.7,50.8C-76.3,36.8,-78.4,19,-76.9,2.6C-75.4,-13.8,-70.4,-29.1,-61.1,-39.1C-51.8,-49.1,-38.2,-53.7,-25.9,-62C-13.6,-70.3,-2.5,-82.3,8.5,-78.6C19.5,-74.9,29,-73.5,42.7,-65.3Z"
                      transform="translate(100 100)"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-8 md:p-12 md:w-3/5">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Send us a message
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...register("name")}
                        placeholder="Your name"
                        className={`${inputClasses} ${
                          errors.name ? "border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="text"
                        {...register("email")}
                        placeholder="your.email@example.com"
                        className={`${inputClasses} ${
                          errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      {...register("subject")}
                      placeholder="What's this about?"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      {...register("message")}
                      rows={5}
                      placeholder="How can we help you?"
                      className={`${textareaClasses} ${
                        errors.message
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <PrimaryBtn
                      type="submit"
                      className="w-full bg-primaryColor hover:bg-primaryColor text-white py-2 px-4 rounded-md"
                      disabled={isSubmitting}
                      name={
                        isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          "Send Message"
                        )
                      }
                    />
                  </div>
                </form>

                <div className="mt-8 text-sm text-gray-500">
                  <p>
                    By submitting this form, you agree to our{" "}
                    <a
                      href="/privacy-policy"
                      className="text-primaryColor hover:underline"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="/terms-and-conditions"
                      className="text-primaryColor hover:underline"
                    >
                      Terms of Service
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
