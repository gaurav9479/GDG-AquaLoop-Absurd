import axios from "axios";

const API_URL = "https://aqualoop-ml-service.onrender.com";

export const simulateTreatmentStage = async (payload) => {
  const res = await axios.post(
    `${API_URL}/treatment/predict-stage`,
    payload
  );
  return res.data;
};


