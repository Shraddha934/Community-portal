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
        {issues?.length > 0 &&
          issues.map((issue) => {
            let lat, lng;

            if (
              issue.location?.coordinates &&
              issue.location.coordinates.length === 2
            ) {
              // GeoJSON case
              lng = issue.location.coordinates[0];
              lat = issue.location.coordinates[1];
            } else if (issue.location?.latitude && issue.location?.longitude) {
              // Direct lat/lng case
              lat = issue.location.latitude;
              lng = issue.location.longitude;
            }

            if (!lat || !lng) return null;

            return (
              <Marker key={issue._id} position={[lat, lng]}>
                <Popup maxWidth={300}>
                  <div className="w-[260px]">
                    {issue.image && (
                      <img
                        src={issue.image}
                        alt="Issue"
                        className="w-full h-28 object-cover rounded-md mb-2"
                      />
                    )}
                    <h3 className="font-bold text-base mb-1 capitalize">
                      {issue.issueType?.replaceAll("_", " ") || "Unknown Type"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <b>Status:</b> {issue.status || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <b>Description:</b>{" "}
                      {issue.description || "No description"}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <b>Location:</b>{" "}
                      {issue.location?.landmark || "Not provided"}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <b>Priority:</b>{" "}
                      <span
                        className={
                          issue.priority === "high"
                            ? "text-red-600 font-semibold"
                            : issue.priority === "medium"
                            ? "text-yellow-600 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {issue.priority || "N/A"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      <b>Reported by:</b> {issue.usermail || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {issue.createdAt
                        ? new Date(issue.createdAt).toLocaleString()
                        : "Date not available"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Floating locate button */}
        <LocateButton setUserLocation={setUserLocation} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
