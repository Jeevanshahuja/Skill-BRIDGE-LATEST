import axios from "axios";

const API = "https://skill-bridge-backend-839758923210.asia-south1.run.app/";

export const getResources = async (resumeId) => {
  const res = await axios.get(`${API}/resume/${resumeId}/resources`);
  return res.data;
};