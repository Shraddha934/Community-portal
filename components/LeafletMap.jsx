"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Component to recenter on user location
const RecenterOnUser = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 15);
    }
  }, [userLocation, map]);

  return null;
};

// Floating "Locate Me" button
const LocateButton = ({ setUserLocation }) => {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        setUserLocation(coords);
        map.setView(coords, 15);
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("Unable to fetch your location.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <button
      onClick={handleLocate}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        border: "1px solid gray",
        borderRadius: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      📍 Locate Me
    </button>
  );
};

const LeafletMap = ({ issues }) => {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] mt-16">
      <MapContainer
        center={[20.5937, 78.9629]} // fallback India
        zoom={5}
        className="w-full h-full rounded-lg shadow-md"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        />

        {/* User location */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>You are here 📍</Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={500}
              pathOptions={{
                color: "blue",
                fillColor: "lightblue",
                fillOpacity: 0.3,
              }}
            />
            <RecenterOnUser userLocation={userLocation} />
          </>
        )}

        {/* Issues */}
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
                    style={{
                      margin: "5px 0 0",
                      fontSize: "13px",
                      color: "gray",
                    }}
                  >
                    Status: <strong>{issue.status}</strong>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Floating locate button */}
        <LocateButton setUserLocation={setUserLocation} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
