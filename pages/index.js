import { useState } from "react";
import MapView from "../components/MapView";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState(null);
  const [stations, setStations] = useState([]);

  const fetchRoute = async () => {
    if (!origin || !destination) return;

    // Geocoding via Nominatim (gratuit)
    const geocode = async (query) => {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await res.json();
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    };

    const [origCoord, destCoord] = await Promise.all([geocode(origin), geocode(destination)]);

    // Fetch route from OSRM
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origCoord.join(",")};${destCoord.join(",")}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    const routeGeoJSON = {
      type: "Feature",
      geometry: data.routes[0].geometry,
    };
    setRoute(routeGeoJSON);

    // Fetch stations depuis Supabase
    const { data: stationsData } = await supabase.from("stations").select("*");
    setStations(stationsData || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🚗 RoadTrip Optimizer</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Origine"
          className="border p-2 rounded w-1/3"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination"
          className="border p-2 rounded w-1/3"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button onClick={fetchRoute} className="bg-blue-600 text-white px-4 py-2 rounded">
          Calculer
        </button>
      </div>
      <MapView routeGeoJSON={route} stations={stations} />
    </div>
  );
}
