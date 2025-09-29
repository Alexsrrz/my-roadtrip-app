// components/MapView.js
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView({ routeGeoJSON, stations }) {
  const mapRef = useRef(null);
  const mapLoadedRef = useRef(false);

  // Init map une seule fois
  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: "map",
      style: "https://demotiles.maplibre.org/style.json",
      center: [2.21, 46.22],
      zoom: 5,
    });

    mapRef.current.on("load", () => {
      mapLoadedRef.current = true;
    });

    // cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Route (polyline)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current || !routeGeoJSON) return;

    if (map.getSource("route")) {
      map.getSource("route").setData(routeGeoJSON);
    } else {
      map.addSource("route", { type: "geojson", data: routeGeoJSON });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#007AFF", "line-width": 4 },
      });
    }

    // Fit bounds si possible
    try {
      const coords = routeGeoJSON.geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 40 });
    } catch (e) {
      // ignore
    }
  }, [routeGeoJSON]);

  // Stations : on utilise une source GeoJSON + layer 'circle' (stabilité au zoom)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    const geojson = {
      type: "FeatureCollection",
      features: (stations || []).map((s) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          // assure la conversion en nombre et l'ordre [lng, lat]
          coordinates: [Number(s.lng), Number(s.lat)],
        },
        properties: {
          name: s.name,
          price: s.price,
        },
      })),
    };

    // Debug rapide (enlève si tout est ok)
    // console.log("stations geojson", geojson);

    if (map.getSource("stations")) {
      map.getSource("stations").setData(geojson);
    } else {
      map.addSource("stations", { type: "geojson", data: geojson });

      map.addLayer({
        id: "stations-layer",
        type: "circle",
        source: "stations",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff3b30",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Popup au clic
      map.on("click", "stations-layer", (e) => {
        const coords = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties || {};
        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(`<strong>${props.name || "Station"}</strong><div>${props.price ?? ""} €/L</div>`)
          .addTo(map);
      });

      // curseur
      map.on("mouseenter", "stations-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "stations-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }, [stations]);

  return <div id="map" style={{ width: "100%", height: "70vh" }} />;
}
