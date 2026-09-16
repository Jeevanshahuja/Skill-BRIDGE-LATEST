import axios from "axios";

const BASE_URL = "https://skill-bridge-backend-839758923210.asia-south1.run.app/";

export const getResumeHistory = async (userId) => {
  const res = await axios.get(`${BASE_URL}/resume/history/${userId}`);
  return res.data;
};