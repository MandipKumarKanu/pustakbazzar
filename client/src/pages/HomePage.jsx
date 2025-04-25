import ArrivalBooks from "@/components/ArrivalBooks";
import Category from "@/components/Category";
import { CreatedBy } from "@/components/CreatedBy";
import DonationSection from "@/components/DonationSection";
import FeaturedBook from "@/components/FeaturedBook";
import HeadingText from "@/components/Heading";
import Hero from "@/components/Hero";
import HomeSearch from "@/components/HomeSearch";
import Recommendation from "@/components/recommendation";
import React from "react";

const HomePage = () => {
  return (
    <>
      <Hero />
      <HomeSearch />
      <Category />
      <HeadingText fullName="Featured Books" bgName="FEATURED" />
      <FeaturedBook />
      <HeadingText fullName="New Arrival" bgName="New Arrival" />
      <ArrivalBooks />
      <HeadingText fullName="Recommendation" bgName="RECOMMENDATION" />
      <Recommendation />
      <HeadingText fullName="Recent Donors" bgName="Donors" />
      <DonationSection />
      {/* <HeadingText fullName="Recommendation" bgName="RECOMMENDATION" />
      <Recommendation /> */}
    </>
  );
};

export default HomePage;
