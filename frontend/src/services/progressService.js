import axios from "axios";

const API = "https://skill-bridge-backend-839758923210.asia-south1.run.app/";

export async function getProgress(resumeId) {
  const res = await axios.get(`${API}/resume/${resumeId}/progress`);
  return res.data;
}

export async function updateProgress(
  resumeId,
  itemType,
  itemName,
  completed
) {
  await axios.post(
    `${API}/resume/${resumeId}/progress`,
    null,
    {
      params: {
        item_type: itemType,
        item_name: itemName,
        completed,
      },
    }
  );
}