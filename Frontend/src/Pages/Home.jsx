import React from 'react'
import ProductSlider from "../components/ProductSlider";
import Input_enter from "../components/Input_Enter/Input_enter";
import Offers_Deals from "../components/Offers_Deals/Offers_Deals";
import PropertyType from "../components/PropertyType/PropertyType";

export function Home() {
 

  return (
    <>
    <Input_enter />
    <Offers_Deals/>
    <PropertyType/>
    <ProductSlider />

    </>
  );
}

export default Home;
