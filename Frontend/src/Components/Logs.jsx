import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Terminal } from "lucide-react";

export default function Logs({ uploadId }) {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:4000", { query: { uploadId, userID: 177345657 } });

    socket.on("log", (msg) => {
      setLogs((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [uploadId]);

  useEffect(() => {
    // Auto-scroll to bottom
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col bg-[#050505] border border-[#333] rounded-lg overflow-hidden h-[400px]">
      <div className="px-4 py-2 border-b border-[#333] flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Terminal className="w-4 h-4" />
          <span>Build Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-500 uppercase">Live</span>
        </div>
      </div>
      <div className="p-4 font-mono text-sm overflow-auto flex-1 text-gray-300">
        {logs.length === 0 && <div className="text-gray-600 italic">Waiting for logs...</div>}
        {logs.map((line, i) => (
          <div key={i} className="py-0.5 hover:bg-white/5 px-2 -mx-2 rounded">
            <span className="text-gray-600 select-none mr-4 text-xs w-8 inline-block text-right">{i + 1}</span>
            {line}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
