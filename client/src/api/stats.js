import { customAxios } from "@/config/axios";

export async function getStats(days = 7) {
  let url = `admin/stats?n=${days}`;
  return customAxios.get(url);
}

export async function getEarnings() {
  let url = `payouts/earnings`;
  return customAxios.get(url);
}

export async function getEarningsOfSeller() {
  let url = `payouts/`;
  return customAxios.get(url);
}

export async function getPayoutHistory(id) {
  let url = `payouts/${id}`;
  return customAxios.get(url);
}

export async function payEarningsOfSeller(id) {
  let url = `payouts/`;
  return customAxios.post(url, { ...id });
}
