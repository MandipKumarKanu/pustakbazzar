export const formatPrice = (price) => {
  if (price === null || typeof price === 'undefined' || isNaN(Number(price))) {
    price = 0;
  }
  // Original formatting logic
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
};
