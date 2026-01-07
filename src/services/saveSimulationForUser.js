import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

export async function saveSimulationForUser({
  industry,
  manualIndustryName,
  influent,
  results,
}) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const uid = user.uid;

  const simulationsRef = collection(
    db,
    "users",
    uid,
    "simulations"
  );

  await addDoc(simulationsRef, {
    industry,
    manualIndustryName: manualIndustryName || null,
    influent,            // frontend-only values
    stages: results,     // stage-wise before/after
    createdAt: Timestamp.now(),
  });
}
