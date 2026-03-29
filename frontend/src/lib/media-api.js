import { apiClient } from "@/lib/api-client";

export async function uploadMediaImages(files, folder) {
  const validFiles = Array.from(files || []).filter(Boolean);

  if (!validFiles.length) {
    return [];
  }

  const formData = new FormData();
  formData.append("folder", folder || "events");

  validFiles.forEach((file) => {
    formData.append("images", file);
  });

  const response = await apiClient.post("/auth/media/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const images = response?.data?.images;
  return Array.isArray(images) ? images : [];
}
