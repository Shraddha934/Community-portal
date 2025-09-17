"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Component to auto-fit map bounds to markers
const FitBounds = ({ issues }) => {
  const map = useMap();

  useEffect(() => {
    if (!issues || issues.length === 0) return;

    const validIssues = issues.filter(
      (i) => i.location?.latitude && i.location?.longitude
    );

    if (validIssues.length > 0) {
      const bounds = validIssues.map((i) => [
        i.location.latitude,
        i.location.longitude,
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [issues, map]);

  return null;
};

const LeafletMap = ({ issues }) => {
  return (
    <MapContainer
      center={[20.5937, 78.9629]} // fallback India center
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />

      {issues
        ?.filter(
          (issue) => issue.location?.latitude && issue.location?.longitude
        )
        .map((issue, idx) => (
          <Marker
            key={idx}
            position={[issue.location.latitude, issue.location.longitude]}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h3
                  style={{
                    margin: "0 0 5px",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {issue.issueType}
                </h3>
                <p style={{ margin: "0", fontSize: "14px" }}>
                  {issue.description}
                </p>
                <p
                  style={{ margin: "5px 0 0", fontSize: "13px", color: "gray" }}
                >
                  Status: <strong>{issue.status}</strong>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Auto zoom/center */}
      <FitBounds issues={issues} />
    </MapContainer>
  );
};

export default LeafletMap;
