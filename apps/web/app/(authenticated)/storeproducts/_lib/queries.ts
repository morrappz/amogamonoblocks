import "server-only";
import callWooCommerceAPI from "@/lib/woocommerce";

// Fetch WooCommerce products (v3 API)
export async function getStoreProducts({
  page = 1,
  perPage = 20,
  search = "",
  sort = [],
  filters = [],
  status = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flags = [],
}: {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: unknown[];
  filters?: unknown[];
  status?: string[];
  flags?: unknown[];
}) {
  let url = `/wc/v3/products?page=${page}&per_page=${perPage}`;

  // Search
  if (search) url += `&search=${encodeURIComponent(search)}`;

  // Sorting (WooCommerce supports 'orderby' and 'order')
  if (Array.isArray(sort) && sort.length > 0) {
    const s = sort[0];
    if (s && s.id) url += `&order_by=${encodeURIComponent(s.id)}`;
    if (s && typeof s.desc === "boolean")
      url += `&order=${s.desc ? "desc" : "asc"}`;
  }

  if (Array.isArray(status) && status.length > 0) {
    url += `&status=${status.join(",")}`;
  }

  // Filters (e.g. status, category, type, etc)
  filters.forEach((f) => {
    if (f && f.id && f.value) {
      url += `&${encodeURIComponent(f.id)}=${encodeURIComponent(f.value)}`;
    }
  });

  console.log("Fetching products from URL:", url);

  const { data, error, pages } = await callWooCommerceAPI(url, {
    method: "GET",
  });
  if (!data || error) throw new Error(error || "Failed to fetch products");
  return {
    data: data,
    pageCount: pages || 1,
  };
}

// Dummy for status count (not used for users, but needed for table structure)
export async function getDocumentCountByField() {
  return {};
}

// Dummy for product groups (not used for users, but needed for table structure)
export async function getProductGroups() {
  return [];
}
