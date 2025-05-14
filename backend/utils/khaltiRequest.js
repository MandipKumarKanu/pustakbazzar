//const fetch = require("node-fetch");

const KHALTI_API_URL = "https://a.khalti.com/api/v2/epayment/";

const khaltiRequest = async (endpoint, payload) => {
  const response = await fetch(`${KHALTI_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

module.exports = { khaltiRequest };

