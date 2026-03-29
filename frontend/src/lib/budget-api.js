import { apiClient } from "@/lib/api-client";

export async function getBudgetSummary(eventId) {
  const response = await apiClient.get(`/budget/${eventId}`);
  return response?.data || null;
}

export async function updateBudget(eventId, totalBudget) {
  await apiClient.put(`/budget/${eventId}`, { totalBudget });
}

export async function getBudgetExpenses(eventId) {
  const response = await apiClient.get(`/budget/${eventId}/expenses`);
  return response?.data || { expenses: [], groupedByCategory: {} };
}

export async function addExpense(eventId, payload) {
  const response = await apiClient.post(`/budget/${eventId}/expenses`, payload);
  return response?.data || null;
}

export async function deleteExpense(eventId, expenseId) {
  await apiClient.delete(`/budget/${eventId}/expenses/${expenseId}`);
}
