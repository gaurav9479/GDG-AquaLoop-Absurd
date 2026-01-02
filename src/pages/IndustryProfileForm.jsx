import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, storage, auth } from "../services/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import AuthLayout from "../components/AuthLayout";

const MAX_LOGO_MB = 2;
const REUSE_OPTIONS = ["Agriculture", "Cooling", "Gardening", "Industrial Reuse"];

export default function IndustryProfileForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);
  const containerRef = useRef(null);

  /* ---------------- STATE ---------------- */
  const [industryName, setIndustryName] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [location, setLocation] = useState(null);

  const [freshWaterIntakeKLD, setFreshWaterIntakeKLD] = useState("");
  const [wasteWaterGeneratedKLD, setWasteWaterGeneratedKLD] = useState("");
  const [reuseKLD, setReuseKLD] = useState("");
  const [dischargeKLD, setDischargeKLD] = useState("");

  const [primaryCapacity, setPrimaryCapacity] = useState("");
  const [secondaryCapacity, setSecondaryCapacity] = useState("");
  const [tertiaryCapacity, setTertiaryCapacity] = useState("");

  const [primaryEquipment, setPrimaryEquipment] = useState("");
  const [secondaryEquipment, setSecondaryEquipment] = useState("");
  const [tertiaryEquipment, setTertiaryEquipment] = useState("");

  const [reusePurpose, setReusePurpose] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- ANIMATION ---------------- */
  useEffect(() => {
    gsap.fromTo(
      containerRef.current?.children,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, stagger: 0.06, duration: 0.5 }
    );
  }, []);

  /* ---------------- PREFILL ---------------- */
  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const d = snap.data();
      setIndustryName(d.industryInfo?.name || "");
      setIndustryType(d.industryInfo?.type || "");
      setEstablishedYear(d.industryInfo?.establishedYear || "");
      setLogoUrl(d.industryInfo?.logoUrl || "");
      setLocation(d.location || null);

      setFreshWaterIntakeKLD(d.waterBalance?.freshWaterIntakeKLD || "");
      setWasteWaterGeneratedKLD(d.waterBalance?.wasteWaterGeneratedKLD || "");
      setReuseKLD(d.waterBalance?.reuseKLD || "");
      setDischargeKLD(d.waterBalance?.dischargeKLD || "");

      setPrimaryCapacity(d.treatmentInfrastructure?.primary?.capacityKLD || "");
      setSecondaryCapacity(d.treatmentInfrastructure?.secondary?.capacityKLD || "");
      setTertiaryCapacity(d.treatmentInfrastructure?.tertiary?.capacityKLD || "");

      setPrimaryEquipment(d.treatmentInfrastructure?.primary?.equipment?.join(", ") || "");
      setSecondaryEquipment(d.treatmentInfrastructure?.secondary?.equipment?.join(", ") || "");
      setTertiaryEquipment(d.treatmentInfrastructure?.tertiary?.equipment?.join(", ") || "");

      setReusePurpose(d.treatmentInfrastructure?.tertiary?.reusePurpose || []);
    })();
  }, [user]);

  /* ---------------- HELPERS ---------------- */
  const toggleReuse = (val) => {
    setReusePurpose((p) =>
      p.includes(val) ? p.filter((x) => x !== val) : [...p, val]
    );
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;
    setLocation({
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  };

  const handleLogoChange = (file) => {
    if (!file) return;
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!industryName || !industryType || !location) {
      alert("Mandatory fields missing");
      return;
    }

    setLoading(true);

    try {
      let finalLogo = logoUrl;

      if (logoFile) {
        const logoRef = ref(storage, `industry_logos/${user.uid}/logo.png`);
        await uploadBytes(logoRef, logoFile);
        finalLogo = await getDownloadURL(logoRef);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          role: "industry",
          profileCompleted: true,
          industryInfo: {
            name: industryName,
            type: industryType,
            establishedYear: Number(establishedYear),
            logoUrl: finalLogo,
          },
          location,
          waterBalance: {
            freshWaterIntakeKLD: Number(freshWaterIntakeKLD),
            wasteWaterGeneratedKLD: Number(wasteWaterGeneratedKLD),
            reuseKLD: Number(reuseKLD),
            dischargeKLD: Number(dischargeKLD),
          },
          treatmentInfrastructure: {
            primary: {
              capacityKLD: Number(primaryCapacity),
              equipment: primaryEquipment.split(",").map(e => e.trim()).filter(Boolean),
            },
            secondary: {
              capacityKLD: Number(secondaryCapacity),
              equipment: secondaryEquipment.split(",").map(e => e.trim()).filter(Boolean),
            },
            tertiary: {
              capacityKLD: Number(tertiaryCapacity),
              equipment: tertiaryEquipment.split(",").map(e => e.trim()).filter(Boolean),
              reusePurpose,
            },
          },
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Save failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
    /* ---------------- UI ---------------- */
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-[720px] p-10 rounded-3xl bg-slate-900/80 text-white backdrop-blur-xl"
      >
        <h1 className="text-3xl text-center mb-8">
          Industry Profile
        </h1>

        <div ref={containerRef} className="space-y-6">

          {/* LOGO */}
          <div className="flex flex-col items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={e => handleLogoChange(e.target.files[0])}
            />
            {(logoPreview || logoUrl) && (
              <img
                src={logoPreview || logoUrl}
                className="h-24 w-24 rounded-full object-cover border"
              />
            )}
          </div>

          {/* BASIC INFO */}
          <input
            className="auth-input"
            placeholder="Industry Name"
            value={industryName}
            onChange={e => setIndustryName(e.target.value)}
          />

          <select
            className="auth-input"
            value={industryType}
            onChange={e => setIndustryType(e.target.value)}
          >
            <option value="">Industry Type</option>
            <option>Chemical</option>
            <option>Textile</option>
            <option>Pharmaceutical</option>
            <option>Food Processing</option>
          </select>

          <input
            className="auth-input"
            placeholder="Established Year"
            value={establishedYear}
            onChange={e => setEstablishedYear(e.target.value)}
          />

          {/* LOCATION */}
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
          >
            <Autocomplete
              onLoad={ref => (autocompleteRef.current = ref)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                className="auth-input"
                placeholder="Search Industry Location (Google Verified)"
              />
            </Autocomplete>
          </LoadScript>

          {/* WATER BALANCE */}
          <h3 className="font-semibold pt-4">Water Balance (KLD)</h3>
          <div className="grid grid-cols-2 gap-3">
            <input className="auth-input" placeholder="Freshwater Intake" value={freshWaterIntakeKLD} onChange={e=>setFreshWaterIntakeKLD(e.target.value)} />
            <input className="auth-input" placeholder="Wastewater Generated" value={wasteWaterGeneratedKLD} onChange={e=>setWasteWaterGeneratedKLD(e.target.value)} />
            <input className="auth-input" placeholder="Reused" value={reuseKLD} onChange={e=>setReuseKLD(e.target.value)} />
            <input className="auth-input" placeholder="Discharged" value={dischargeKLD} onChange={e=>setDischargeKLD(e.target.value)} />
          </div>

          {/* TREATMENT */}
          <h3 className="font-semibold pt-4">Treatment Infrastructure</h3>

          <input className="auth-input" placeholder="Primary Capacity (KLD)" value={primaryCapacity} onChange={e=>setPrimaryCapacity(e.target.value)} />
          <input className="auth-input" placeholder="Primary Equipment (comma separated)" value={primaryEquipment} onChange={e=>setPrimaryEquipment(e.target.value)} />

          <input className="auth-input" placeholder="Secondary Capacity (KLD)" value={secondaryCapacity} onChange={e=>setSecondaryCapacity(e.target.value)} />
          <input className="auth-input" placeholder="Secondary Equipment (comma separated)" value={secondaryEquipment} onChange={e=>setSecondaryEquipment(e.target.value)} />

          <input className="auth-input" placeholder="Tertiary Capacity (KLD)" value={tertiaryCapacity} onChange={e=>setTertiaryCapacity(e.target.value)} />
          <input className="auth-input" placeholder="Tertiary Equipment (comma separated)" value={tertiaryEquipment} onChange={e=>setTertiaryEquipment(e.target.value)} />

          {/* REUSE PURPOSE */}
          <h3 className="font-semibold pt-4">Reuse Purpose</h3>
          {REUSE_OPTIONS.map(r => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={reusePurpose.includes(r)}
                onChange={() => toggleReuse(r)}
              />
              {r}
            </label>
          ))}
        </div>

        {/* ACTIONS */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>

        <button
          onClick={() => signOut(auth)}
          className="w-full mt-3 text-red-400 text-sm"
        >
          Sign Out
        </button>
      </motion.div>
    </AuthLayout>
  );

}
