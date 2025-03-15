import React from "react";
import { AnimatedTooltip } from "./animated-tooltip";
const people = [
  {
    id: 1,
    name: "Mandip Kumar Kanu",
    designation: "Backend & Frontend",
    image:
      "https://scontent.fjkr1-1.fna.fbcdn.net/v/t39.30808-6/468505047_879049587773795_4817000239194574334_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHuzG-IOsKdolQIr1YvDvE7Ml5iZaQ2moYyXmJlpDaahgQKBHHZBu7b27vrqwYxaMILx6-3gCCJtuZonZl8rVSJ&_nc_ohc=G_bZaXtEs8UQ7kNvgH4hIfc&_nc_oc=AdjeViRX6aQwD0J0YKUxJhlx-ajF-ghZg7L7_aJ-eQY9n3SUGAf953tLTL47Hc2LW9Y&_nc_zt=23&_nc_ht=scontent.fjkr1-1.fna&_nc_gid=AdPcWvA5mYSNDxTIru44cWX&oh=00_AYF523IvzPdDLkgIMjbSKUsvCmHSwFaZ1gwQlZLL-Pw3DA&oe=67D6B2C6",
    link: "https://github.com/mandipkumarkanu",
  },
  {
    id: 2,
    name: "Aadarsh Kumar",
    designation: "Backend & Documentaion",
    image:
      "https://scontent.fjkr1-1.fna.fbcdn.net/v/t39.30808-6/481255495_1771915846717321_5216524986793850438_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHBEdh5zgBdmehGKTiN6OMS00K3qt9ZMc7TQreq31kxzpT49Qr2NT8Xa4tEQ9jlFrf4fqD9BfgJn7W1zVcJtQKV&_nc_ohc=NtwvZDWJ62cQ7kNvgH3NMZz&_nc_oc=Adih-K0TLDgM5JUW-ukUAzC1JtGE8JBJg0LWkgHLSR1wKhfEzSdiPPlC0Qj8ClDqXjc&_nc_zt=23&_nc_ht=scontent.fjkr1-1.fna&_nc_gid=Ak8BfCaRfcEd2T1URkVBLfR&oh=00_AYGd_34MsZdl1Hm_OOEIm2tX0Mb_DztMpxpsJurMs4a1-Q&oe=67D6B0E0",
    link: "https://github.com/aadik6",
  },
];

export function CreatedBy() {
  return (
    <div className="flex flex-row items-center justify-center mb-10 w-full">
      <AnimatedTooltip items={people} />
    </div>
  );
}
