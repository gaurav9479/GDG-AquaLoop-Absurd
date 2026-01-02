


import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const simulateTreatmentStage = async (payload) => {
  const res = await axios.post(
    `${API_URL}/treatment/predict-stage`,
    payload
  );
  return res.data;
};
