// components/IssueMap.jsx
"use client";
import dynamic from "next/dynamic";

// Dynamically load LeafletMap only on client
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

const IssueMap = ({ issues }) => {
  return <LeafletMap issues={issues} />;
};

export default IssueMap;
