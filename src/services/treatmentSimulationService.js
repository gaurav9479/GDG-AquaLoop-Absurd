
import axios from "axios";

const ML_API_URL = "https://aqualoop-ml-service.onrender.com";

export const simulateTreatmentStage = async (data) => {
  const response = await axios.post(
    `${ML_API_URL}/treatment/predict-stage`,
    data,
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
};
