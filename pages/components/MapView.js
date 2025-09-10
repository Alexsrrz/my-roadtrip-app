import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function MapView({ routeGeoJSON, stations }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: "map",
        style: "https://demotiles.maplibre.org/style.json",
        center: [2.21, 46.22], // France
        zoom: 5,
      });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Add route
    if (routeGeoJSON) {
      if (map.getSource("route")) {
        map.getSource("route").setData(routeGeoJSON);
      } else {
        map.addSource("route", { type: "geojson", data: routeGeoJSON });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: { "line-color": "#007AFF", "line-width": 4 }
        });
      }
    }

    // Add stations
    stations.forEach(station => {
      new maplibregl.Marker({ color: "red" })
        .setLngLat([station.lng, station.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<b>${station.name}</b><br/>${station.price} €/L`))
        .addTo(map);
    });
  }, [routeGeoJSON, stations]);

  return <div id="map" className="w-full h-[70vh] rounded-xl shadow" />;
}
