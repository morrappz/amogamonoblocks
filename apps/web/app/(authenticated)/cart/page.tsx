import React from "react";
import Cart from "./_components/Cart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Cart",
};

const data = [
  {
    id: "1",
    name: "Classic Chronograph Watch",
    price: 299.99,
    originalPrice: 399.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    color: "Black",
    size: "Standard",
    stock: 5,
  },
  {
    id: "2",
    name: "Sport Diver Watch",
    price: 199.99,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    color: "Blue",
    size: "Standard",
    stock: 3,
  },
];

const Page = async () => {
  //replace the data with api data
  //   const data = await fetchApiData()
  return (
    <div>
      <Cart data={data} />
    </div>
  );
};

export default Page;
