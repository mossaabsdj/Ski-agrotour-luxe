"use client";
import { Eye, EyeOff } from "lucide-react";

import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { countries } from "@/data/countries";
import Swal from "sweetalert2";
import { signIn } from "next-auth/react";
import OtpModal from "@/app/component/OtpModal";
import ForgotOtpModal from "@/app/component/OtpModalForgot";
import Progression from "@/app/component/Proogression/page";
const COLORS = {
  formBorder: "border-green-500",
  formFocus: "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
  buttonBg: "bg-emerald-500",
  buttonHover: "hover:bg-emerald-600",
  socialBg: "bg-green-100",
  rightPaneBg: "bg-emerald-500",
};

const SOCIAL_ICONS = [
  { Icon: FaFacebookF, label: "Facebook" },
  { Icon: FaTwitter, label: "Twitter" },
  { Icon: FaInstagram, label: "Instagram" },
];

const FormInput = ({ type, placeholder, value, onChange, className = "" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`h-14 px-4 rounded-lg border-2 ${COLORS.formBorder} ${COLORS.formFocus} text-gray-800 outline-none transition ${className}`}
    required
  />
);

const SocialButtons = () => (
  <div className="flex gap-4 mt-4">
    {SOCIAL_ICONS.map(({ Icon, label }, idx) => (
      <button
        key={idx}
        type="button"
        className={`${COLORS.socialBg} p-3 rounded-full shadow-md hover:scale-110 cursor-pointer transition ${COLORS.formFocus}`}
        aria-label={label}
      >
        <Icon className="text-emerald-600" />
      </button>
    ))}
  </div>
);

const WelcomeSection = ({ title, description, isRight }) => (
  <div
    className={`hidden md:flex w-full md:w-1/2 ${
      COLORS.rightPaneBg
    } text-white flex-col justify-center items-center text-center p-10 ${
      isRight ? "order-2" : "order-1"
    }`}
    style={{ minHeight: "600px" }}
  >
    <img
      src="/images/logo.png"
      alt="Logo"
      className="w-32 h-32 rounded-full mb-6 shadow-2xl object-cover bg-white"
    />
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-lg opacity-90 max-w-sm">{description}</p>
  </div>
);

export default function FlipAuthPages() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForogtOtpModal, setShowForogtOtpModal] = useState(false);

  const [pendingUser, setPendingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const handleLoginChange = (field) => (e) => {
    setLoginData((prev) => ({ ...prev, [field]: e.target.value }));
  };
  const handleForgotPassword = () => {
    // Ex: ouvrir une modal, naviguer vers une page, afficher un formulaire, etc.
    setShowResetPassword(true);
  };

  const handleRegisterChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "phone") {
      // ✅ Allow only digits and plus sign
      value = value.replace(/[^\d+]/g, ""); // remove everything except digits and +

      // ✅ Only allow one "+" and only at the beginning
      if (value.includes("+")) {
        value = "+" + value.replace(/\+/g, ""); // keep + only at start
      }

      // ✅ Optional: limit total length (e.g., 13 characters for +countrycode)
      if (value.length > 13) value = value.slice(0, 13);
    }
    setRegisterData((prev) => {
      const updated = { ...prev, [field]: value };

      // Update phone number prefix when country changes
      if (field === "country") {
        const selectedCountry = countries.find((c) => c.name === value);
        if (selectedCountry) {
          updated.phone = selectedCountry.code + " ";
        }
      }

      return updated;
    });
  };
  const handleLoginSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const { email, password } = loginData;
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/DashBoard",
    });
    setIsLoading(false);

    if (res?.ok) {
      // ✅ Success - redirect manually
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        showConfirmButton: false,
        customClass: {
          popup: "shadow-lg rounded-lg", // optional for soft edges and shadow
        },
        timer: 1500,
      }).then(() => {
        setIsLoading(true);
        window.location.href = res.url;
      });
    } else {
      // ❌ Error - show alert
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
        confirmButtonColor: "#d32f2f", // red confirm button
        customClass: {
          popup: "shadow-lg rounded-lg", // optional for soft edges and shadow
        },
      });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, country, password, confirmPassword } =
      registerData;

    // ✅ 1. Check for empty fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !country ||
      !password ||
      !confirmPassword
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#f39c12",
      });
      return;
    }

    // ✅ 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    // ✅ 3. Validate phone number (digits only, optional +)
    const phoneRegex = /^\+?\d{8,13}$/;
    if (!phoneRegex.test(phone)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must contain only digits (and an optional +), between 8 and 13 digits.",
      });
      return;
    }

    // ✅ 4. Validate password length
    if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must be at least 8 characters long.",
      });
      return;
    }

    // ✅ 5. Validate password match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure both passwords are identical.",
      });
      return;
    }
    setIsLoading(true);
    // 1️⃣ Send OTP first
    const otpRes = await fetch("/api/register/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setIsLoading(false);

    if (!otpRes.ok) {
      Swal.fire({
        icon: "error",
        title: "Failed to send OTP",
      });
      return;
    }
    // 2️⃣ Store user data locally
    setPendingUser({
      fullName,
      email,
      phone,
      country,
      password,
      confirmPassword,
    });

    // 3️⃣ Show OTP Modal
    setShowOtpModal(true);
  };
  const handleResetPassword = () => {
    setShowResetPassword(false);
    setShowForogtOtpModal(true);
  };
  return (
    <>
      {" "}
      {showResetPassword && (
        <div className="fixed inset-0 z-[1000]  bg-opacity-40 backdrop-blur-md flex justify-center items-center">
          <div className="bg-white p-10 rounded-3xl w-[90%] max-w-xl shadow-2xl transform scale-105">
            <h3 className="text-3xl font-extrabold text-center mb-6">
              Reset Password
            </h3>

            <p className="text-gray-600 text-base mb-6 text-center">
              Enter your email and we will send you a reset link.
            </p>

            <FormInput
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="text-lg w-full"
            />

            <button
              onClick={handleResetPassword}
              className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-full shadow-md transition-colors"
            >
              Next
            </button>

            <button
              className="w-full mt-3 text-gray-600 hover:text-gray-800 underline text-base transition-colors"
              onClick={() => setShowResetPassword(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {isLoading && <Progression isVisible={true} />}
      {showOtpModal && (
        <OtpModal
          email={pendingUser?.email || resetEmail}
          onExit={() => setShowOtpModal(false)}
          onVerify={{
            userData: pendingUser || resetEmail,
            success: () => {
              setShowOtpModal(false);
              setIsFlipped(false); // go back to login scene
            },
          }}
        />
      )}
      {showForogtOtpModal && (
        <ForgotOtpModal
          email={resetEmail}
          onExit={() => setShowForogtOtpModal(false)}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-6xl" style={{ perspective: "2000px" }}>
          <div
            className="relative w-full transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              minHeight: "600px",
            }}
          >
            {/* LOGIN PAGE (Front) */}
            <div
              className="absolute w-full"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Login Form */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center order-1">
                  <div className="w-full max-w-sm">
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-2 text-center">
                      Log In
                    </h2>
                    <p className="text-gray-500 mb-6 text-center">
                      Welcome back! Please login to your account.
                    </p>

                    <div className="w-full flex flex-col space-y-4">
                      <FormInput
                        type="email"
                        placeholder="Email"
                        value={loginData.email}
                        onChange={handleLoginChange("email")}
                        className="w-full"
                      />

                      <FormInput
                        type="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleLoginChange("password")}
                        className="w-full"
                      />

                      <button
                        onClick={handleLoginSubmit}
                        className={`w-full h-14 text-xl ${COLORS.buttonBg} text-white font-bold rounded-full shadow-md ${COLORS.buttonHover} hover:scale-105 transition-all duration-200 mt-2`}
                      >
                        Log In
                      </button>
                      <p className="text-gray-700 text-sm text-center pt-2">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </p>
                      <p className="text-gray-700 text-sm text-center pt-2">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setIsFlipped(true)}
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          Create Account
                        </button>
                      </p>

                      <div className="flex justify-center">
                        <SocialButtons />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome Section - Right */}
                <WelcomeSection
                  title="Welcome Back!"
                  description="Manage your orders, explore new products, and connect with your favorite farms — all from one place."
                  isRight={true}
                />
              </div>
            </div>

            {/* REGISTER PAGE (Back) */}
            <div
              className="absolute w-full"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Welcome Section - Left */}
                <WelcomeSection
                  title="Join Our Community!"
                  description="Create an account to access exclusive features, track your orders, and connect with local farms."
                  isRight={false}
                />

                {/* Register Form */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center order-2">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-2 text-center">
                      Sign Up
                    </h2>
                    <p className="text-gray-500 mb-6 text-center">
                      Create your account to get started.
                    </p>

                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          type="text"
                          placeholder="Full Name"
                          value={registerData.fullName}
                          onChange={handleRegisterChange("fullName")}
                          className="w-full"
                        />
                        <FormInput
                          type="email"
                          placeholder="Email"
                          value={registerData.email}
                          onChange={handleRegisterChange("email")}
                          className="w-full"
                        />
                        <select
                          value={registerData.country}
                          onChange={handleRegisterChange("country")}
                          className={`h-14 px-4 rounded-lg border-2 ${COLORS.formBorder} ${COLORS.formFocus} text-gray-800 outline-none transition w-full`}
                          required
                        >
                          <option value="">Select Country</option>
                          {countries.map((country, idx) => (
                            <option key={idx} value={country.name}>
                              {country.name} ({country.code})
                            </option>
                          ))}
                        </select>
                        <FormInput
                          type="tel"
                          placeholder="Phone Number"
                          value={registerData.phone}
                          onChange={handleRegisterChange("phone")}
                          className="w-full"
                          maxLength={12} // 👈 limits input to 10 characters
                        />

                        <div className="relative w-full">
                          <FormInput
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={registerData.password}
                            onChange={handleRegisterChange("password")}
                            className="w-full pr-10"
                          />
                          <button
                            type="button"
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                            onTouchStart={() => setShowPassword(true)}
                            onTouchEnd={() => setShowPassword(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                        <div className="relative w-full">
                          <FormInput
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange("confirmPassword")}
                            className="w-full pr-10"
                          />
                          <button
                            type="button"
                            onMouseDown={() => setShowConfirmPassword(true)}
                            onMouseUp={() => setShowConfirmPassword(false)}
                            onMouseLeave={() => setShowConfirmPassword(false)}
                            onTouchStart={() => setShowConfirmPassword(true)}
                            onTouchEnd={() => setShowConfirmPassword(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleRegisterSubmit}
                        className={`w-full h-14 text-xl ${COLORS.buttonBg} text-white font-bold rounded-full shadow-md ${COLORS.buttonHover} hover:scale-105 transition-all duration-200 mt-6`}
                      >
                        Create Account
                      </button>

                      <p className="text-gray-700 text-sm text-center pt-4">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setIsFlipped(false)}
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          Log In
                        </button>
                      </p>

                      <div className="flex justify-center">
                        <SocialButtons />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
