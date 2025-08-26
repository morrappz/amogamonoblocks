"use client";

import { useEffect, useState } from 'react';

export default function ShopifyProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch('/api/shopify/products');
      const data = await response.json();
      setProducts(data.products || []);
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Shopify Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
    </div>
  );
}
