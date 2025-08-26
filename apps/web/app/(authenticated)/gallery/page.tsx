import React from "react";
import Gallery from "./_components/Gallery";

const images = [
  {
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1470&auto=format&fit=crop",
    alt: "Modern architecture with glass and steel structures",
    width: 1470,
    height: 980,
  },
  {
    src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1474&auto=format&fit=crop",
    alt: "Historic building with ornate details and columns",
    width: 1474,
    height: 982,
  },
  {
    src: "https://images.unsplash.com/photo-1486718448742-163732cd1544?q=80&w=1470&auto=format&fit=crop",
    alt: "Minimalist concrete structure with clean lines",
    width: 1470,
    height: 980,
  },
  {
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1470&auto=format&fit=crop",
    alt: "Futuristic museum design with curved surfaces",
    width: 1470,
    height: 980,
  },
  {
    src: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1467&auto=format&fit=crop",
    alt: "Brutalist architectural style with raw concrete elements",
    width: 1467,
    height: 978,
  },
];

const Page = () => {
  return (
    <div>
      <Gallery data={images} />
    </div>
  );
};

export default Page;
