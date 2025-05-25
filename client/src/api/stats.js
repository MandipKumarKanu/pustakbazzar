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

export async function getPlatformFeeReport(params = {}) {
  const { startDate, endDate, groupBy = "monthly" } = params;

  let url = "admin/get-platform-fee-report";

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  queryParams.append("groupBy", groupBy);

  if (queryParams.toString()) {
    url = `${url}?${queryParams.toString()}`;
  }

  return customAxios.get(url);
}
export async function getSalesPerformanceReport(params = {}) {
  const { startDate, endDate, group } = params;

  let url = "admin/get-sales-performance-report";

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (group) queryParams.append("group", group);

  if (queryParams.toString()) {
    url = `${url}?${queryParams.toString()}`;
  }

  return customAxios.get(url);
}

export async function geBookReport(params = {}) {
  const { startDate, endDate, groupBy } = params;

  let url = "admin/book-activity-report";

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (groupBy) queryParams.append("groupBy", groupBy);

  if (queryParams.toString()) {
    url = `${url}?${queryParams.toString()}`;
  }

  return customAxios.get(url);
}
