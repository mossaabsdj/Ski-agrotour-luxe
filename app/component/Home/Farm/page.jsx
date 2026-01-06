"use client";
import { Skeleton } from "@/components/ui/skeleton"; // if you use shadcn/ui
import ProductOrderModal from "@/app/component/Home/AddToCommande/page";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRef, forwardRef, useEffect, useState } from "react";
import objects from "@/app/Texts/content.json";
import Footer from "@/app/component/Home/Footer/page";
import Commande from "@/app/component/Home/Farm/AddCommande/modal";
import React from "react";
import ProgressPage from "@/app/component/Proogression/page";
const CheesePage = forwardRef(({ FarmData }, refCommande) => {
  const scrollerRef = useRef(null);
  const data = objects.Commande;
  const cheeseVarietiesRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]); // Store all fetched products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // 1. Add loading state
  // Add image loading states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [cateringImgLoaded, setCateringImgLoaded] = useState(false);
  const [bungalowImgLoaded, setBungalowImgLoaded] = useState(false);
  const [imgLoadedMap, setImgLoadedMap] = useState({});
  const handleOrder = (product) => {
    // ➤ Ici tu fais ce que tu veux : ouvrir modal, redirection, WhatsApp, panier…
    //  alert("Commande du produit : " + JSON.stringify(product));
    setSelectedProduct(product);
  };
  const handleConfirmOrder = async (orderData) => {
    // If no user → show alert + redirect
    if (!session || !session.user) {
      localStorage.setItem("pendingOrder", JSON.stringify(orderData));

      Swal.fire({
        icon: "warning",
        title: "You must be logged in",
        text: "Please log in to complete your order.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        router.push("/Login");
      });
      return;
    }

    // ============================
    // 🔍 Validate required fields
    // ============================
    if (!orderData.address || orderData.address.trim() === "") {
      return Swal.fire({
        icon: "warning",
        title: "Missing Address",
        text: "Please enter your delivery address.",
      });
    }

    if (!orderData.packagingId) {
      return Swal.fire({
        icon: "warning",
        title: "Select Packaging",
        text: "Please choose a packaging option.",
      });
    }

    if (!orderData.quantity || orderData.quantity < 1) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be at least 1.",
      });
    }

    if (!orderData.productId) {
      return Swal.fire({
        icon: "warning",
        title: "Product Error",
        text: "No product selected. Please try again.",
      });
    }

    // ------------------------------
    // Prepare the payload for the API
    // ------------------------------
    const payload = {
      adresse: orderData.address,
      emballage: orderData.packagingId,
      quantite: orderData.quantity,
      productId: orderData.productId,
      compteId: session.user.id,
      status: null,
    };

    try {
      const res = await fetch("/api/Commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to send order");
      }

      const result = await res.json();

      // Success popup
      Swal.fire({
        icon: "success",
        title: "Order Confirmed!",
        text: "Your order has been created successfully.",
        confirmButtonColor: "#3085d6",
      });

      //  setCommandes((prev) => [...prev, result]);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Order error:", error);

      // Error popup
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Something went wrong while creating your order.",
      });
    }
  };

  const scrollByCard = (direction = 1) => {
    const container = scrollerRef.current;
    if (!container) return;
    const card = container.querySelector(".product-card");
    if (!card) return;
    const scrollAmount = card.offsetWidth + 32; // gap-8
    container.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };
  const scrollToCheeseVarieties = () => {
    cheeseVarietiesRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    setLoading(true);
    fetch("/api/Product")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data); // Save all products
        setLoading(false); // 2. Set loading to false after fetch
      });
  }, []);
  useEffect(() => {
    if (!FarmData) return;
    // Always filter from allProducts, not products
    const filteredProducts = allProducts.filter(
      (p) => p.farm?.name === FarmData.hero.title
    );
    console.log("filtred" + JSON.stringify(filteredProducts));
    setProducts(filteredProducts);
  }, [FarmData, allProducts]);
  if (!FarmData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-0 px-0">
        {/* Hero Skeleton */}
        <div className="w-full flex justify-center items-center px-4 py-10">
          <div className="w-full max-w-7xl bg-white shadow-2xl rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <div className="mb-6">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-5/6 mb-2" />
                <Skeleton className="h-6 w-2/3 mb-6" />
              </div>
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
            <div className="flex-shrink-0">
              <Skeleton className="w-40 h-40 md:w-72 md:h-72 rounded-xl" />
            </div>
          </div>
        </div>
        {/* Cheese Varieties Skeleton */}
        <div className="w-full max-w-6xl min-h-[60vh] p-10 flex flex-col items-center justify-center">
          <div className="w-full shadow-lg min-h-[40vh] flex flex-col items-center bg-white p-10">
            <Skeleton className="h-10 w-60 mb-8" />
            <div className="flex gap-8 w-full justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[300px] max-w-[350px] bg-gray-50 rounded-xl shadow-md flex flex-col items-center overflow-hidden"
                >
                  <Skeleton className="w-full h-[220px]" />
                  <div className="p-4 w-full">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  useEffect(() => {
    setHeroImgLoaded(false);
  }, []);

  return (
    <>
      {selectedProduct && (
        <ProductOrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirmOrder}
        />
      )}
      <ProgressPage isVisible={!heroImgLoaded} />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-0   overflow-hidden snap-y snap-mandatory">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }} // <-- add this line
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.3 }}
          className="w-full flex snap-end justify-center items-center px-4 py-10"
        >
          <Card className="w-full max-w-7xl bg-white shadow-2xl rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center md:text-left leading-tight mb-6">
                  {FarmData.hero.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6 text-justify whitespace-pre-line">
                  {FarmData.hero.description}
                </p>
                <div className="flex justify-center md:justify-start">
                  <Button
                    onClick={scrollToCheeseVarieties} // 3. Add onClick here
                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full shadow-md"
                  >
                    {FarmData.hero.button}
                  </Button>
                </div>
              </CardContent>
            </div>
            <div className="flex-shrink-0 relative w-40 h-40 md:w-72 md:h-72">
              {!heroImgLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
              )}
              <Image
                src={FarmData.hero.image.src}
                alt={FarmData.hero.image.alt}
                width={FarmData.hero.image.width}
                height={FarmData.hero.image.height}
                className={`w-40 h-40 md:w-72 md:h-72 object-cover rounded-xl shadow-lg transition-opacity duration-300 ${
                  heroImgLoaded ? "opacity-100" : "opacity-0"
                }`}
                priority
                onLoad={() => setHeroImgLoaded(true)}
              />
            </div>
          </Card>
        </motion.div>
        <div ref={refCommande}>
          {" "}
          {/* Cheese Varieties Section */}
          <motion.div
            ref={cheeseVarietiesRef}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
            className="w-full max-w-6xl snap-start min-h-screen p-4 sm:p-10 flex flex-col items-center justify-center"
          >
            <Card className="w-full shadow-lg min-h-[80vh] flex flex-col items-center bg-white p-4 sm:p-10">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-center">
                  Cheese Varieties
                </CardTitle>
              </CardHeader>

              <div className="relative w-full">
                {/* Left Scroll Button (desktop only) */}
                <button
                  onClick={() => scrollByCard(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full shadow p-2 hidden md:block"
                >
                  <svg
                    width="28"
                    height="28"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21l-6-7 6-7" />
                  </svg>
                </button>

                {/* Scrollable Product Cards */}
                <div
                  ref={scrollerRef}
                  className="flex overflow-x-auto gap-4 sm:gap-6 md:gap-8 w-full pb-4 snap-x snap-mandatory px-1 sm:px-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="product-card group snap-center min-w-[260px] sm:min-w-[300px] max-w-[350px] bg-gray-50 rounded-xl shadow-md flex flex-col items-center overflow-hidden"
                      >
                        <div className="w-full h-[220px] relative">
                          <Skeleton className="w-full h-full" />
                        </div>
                        <CardContent className="p-4 text-center w-full">
                          <Skeleton className="h-8 w-3/4 mb-2 mx-auto" />
                          <Skeleton className="h-6 w-1/2 mx-auto" />
                        </CardContent>
                      </div>
                    ))
                  ) : products.length === 0 ? (
                    <div className="w-full text-center text-gray-400 py-16">
                      No product found for this farm.
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.title}
                        className="product-card group snap-center min-w-[260px] sm:min-w-[300px] max-w-[350px] bg-gray-50 rounded-xl shadow-md flex flex-col items-center overflow-hidden"
                      >
                        <div className="w-full h-[220px] relative">
                          {!imgLoadedMap[product.title] && (
                            <Skeleton className="absolute inset-0 w-full h-full" />
                          )}
                          <Image
                            src={product?.image}
                            alt={product.image.alt}
                            width={320}
                            height={220}
                            className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 transition-opacity duration-300 ${
                              imgLoadedMap[product.title]
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                            onLoad={() =>
                              setImgLoadedMap((prev) => ({
                                ...prev,
                                [product.title]: true,
                              }))
                            }
                          />
                          <div className="absolute inset-0 z-10 scale-110 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
                            <span className="text-white text-sm text-center z-20">
                              {product.desc}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-4 text-center w-full">
                          <h3 className="text-2xl font-bold mb-1">
                            {product.title}
                          </h3>
                          <span className="text-green-700 font-semibold text-lg">
                            {product.prix} DA
                          </span>
                          {/* ===== Bouton Commander ===== */}
                          <button
                            onClick={() => handleOrder(product)}
                            className="mt-3 w-full bg-gray-800 text-white py-2 rounded-xl hover:bg-gray-700 transition"
                          >
                            Order Now
                          </button>
                        </CardContent>
                      </div>
                    ))
                  )}
                </div>

                {/* Right Scroll Button (desktop only) */}
                <button
                  onClick={() => scrollByCard(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full shadow p-2 hidden md:block"
                >
                  <svg
                    width="28"
                    height="28"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 21l6-7-6-7" />
                  </svg>
                </button>
              </div>

              {/* Scroll Hint (only on mobile) */}
              <div className="mt-4 text-gray-400 text-sm block md:hidden text-center">
                ← Swipe for more products →
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Catering Section */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }} // <-- add this line
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
          className="w-full max-w-5xl snap-start min-h-screen flex items-center justify-center"
        >
          <Card className="shadow-lg min-h-[80vh] flex flex-col md:flex-row items-center bg-white p-10 w-full">
            <div className="flex-1 p-8 order-2 md:order-1">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-4xl font-bold mb-4">
                  {FarmData.catering.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-700 text-lg mb-6 whitespace-pre-line">
                  {FarmData.catering.description}
                </p>
              </CardContent>
            </div>
            <div className="flex-1 order-1 md:order-2 flex justify-center items-center relative">
              {!cateringImgLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
              )}
              <Image
                src={FarmData.catering.image.src}
                alt={FarmData.catering.image.alt}
                width={FarmData.catering.image.width}
                height={FarmData.catering.image.height}
                className={`rounded-lg object-cover w-full h-full max-h-[70vh] transition-opacity duration-300 ${
                  cateringImgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setCateringImgLoaded(true)}
              />
            </div>
          </Card>
        </motion.div>

        {/* Bungalow Section */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }} // <-- add this line
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
          className="w-full max-w-5xl snap-start min-h-screen flex items-center justify-center"
        >
          <Card className="shadow-lg min-h-[80vh] flex flex-col md:flex-row items-center bg-white p-10 w-full">
            <div className="flex-1 order-2 md:order-1 flex justify-center items-center relative">
              {!bungalowImgLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
              )}
              <Image
                src={FarmData.bungalow.image.src}
                alt={FarmData.bungalow.image.alt}
                width={FarmData.bungalow.image.width}
                height={FarmData.bungalow.image.height}
                className={`rounded-lg object-cover w-full h-full max-h-[70vh] transition-opacity duration-300 ${
                  bungalowImgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setBungalowImgLoaded(true)}
              />
            </div>
            <div className="flex-1 p-8 order-1 md:order-2">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-4xl font-bold mb-4">
                  {FarmData.bungalow.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-700 text-lg mb-6 whitespace-pre-line">
                  {FarmData.bungalow.description}
                </p>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Commande Section
        
          <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }} // <-- add this line
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
          className="w-full max-w-5xl snap-center min-h-screen flex items-center justify-center"
        >
          <div
            ref={refCommande}
            className="scroll-mt-34" // Tailwind utility
          ></div>
        </motion.div>*/}
      </div>
    </>
  );
});

export default CheesePage;
