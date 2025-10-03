// Logs.js
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function Logs({ uploadId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:4000", { query: { uploadId } });

    socket.on("log", (msg) => {
      setLogs((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [uploadId]);

  return (
    <div style={{ background: "#111", color: "lime", padding: "10px", fontFamily: "monospace" }}>
      <h3>Logs for {uploadId}</h3>
      {logs.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
