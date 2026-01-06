"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/app/component/navbar/page";
import Footer from "@/app/component/Home/Footer/page";
import FirstPAge from "@/app/component/Home/FirstPage/page";
import ProductList from "@/app/component/Home/ProductsList/page";
import Commande from "@/app/component/Home/AddCommande/modal";
import FarmPage from "@/app/component/Home/Farm/page";
import DashBoardPage from "@/app/Login/page";
import objects from "@/app/Texts/content.json";
import { motion } from "framer-motion";
import FarmsDiscover from "@/app/component/Home/newpage/newpage";
export default function Home() {
  const [selectedFarm, setSelectedFarm] = useState("Home");
  const [displayFarm, setdisplayFarm] = useState(false);
  const [prevfarm, setprevfarm] = useState("");
  const [FarmData, setFarmData] = useState([]);
  const [DashBoard, setDashBoard] = useState(false);
  const refCommande = useRef(null);
  const refDiscoverPAge = useRef(null);
  const scrollOrder = () => {
    if (refCommande.current) {
      refCommande.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const scrolDiscoverpage = () => {
    refDiscoverPAge.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // or "auto"
    });
  };

  useEffect(() => {
    if (selectedFarm) {
      handleSelection(selectedFarm);
    }
  }, [selectedFarm]);

  const handleSelection = (farm) => {
    if (farm === "Home") {
      setdisplayFarm(false);
    } else if (farm === "traditional cheese") {
      setFarmData(objects.Farms.TraditionalCheese);
      setdisplayFarm(true);
    } else if (farm === "animal husbandry") {
      setFarmData(objects.Farms.AnimalHusbandry);
      setdisplayFarm(true);
    } else if (farm === "aquaculture farm") {
      setFarmData(objects.Farms.aquaculturefarm);
      setdisplayFarm(true);
    } else if (farm === "red fruit farm") {
      setFarmData(objects.Farms.redfruitfarm);
      setdisplayFarm(true);
    } else if (farm === "honey farm") {
      setFarmData(objects.Farms.honeyproducingfarm);
      setdisplayFarm(true);
    } else if (farm === "edible mushroom farm") {
      setFarmData(objects.Farms.ediblemushroomfarm);
      setdisplayFarm(true);
    } else if (farm === "admin") {
      setdisplayFarm(false);
      setDashBoard(true);
    }
    if (farm != "order") {
      scrollToTop();
    }
  };

  return (
    <>
      {DashBoard ? (
        <DashBoardPage />
      ) : (
        <>
          <Header
            select={setSelectedFarm}
            scroletoorder={scrollOrder}
            selected_from_DescoverPage={selectedFarm}
          />
          {displayFarm ? (
            <FarmPage FarmData={FarmData} ref={refCommande} />
          ) : (
            <>
              <FirstPAge scroleDiscover={scrolDiscoverpage} />
              <div ref={refDiscoverPAge}>
                <FarmsDiscover setselectedfarm={setSelectedFarm} />
              </div>
              <div ref={refCommande}>
                {" "}
                <ProductList />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }} // <-- add this line
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, amount: 0.3 }}
              ></motion.div>
            </>
          )}
          <Footer />
        </>
      )}
    </>
  );
}
