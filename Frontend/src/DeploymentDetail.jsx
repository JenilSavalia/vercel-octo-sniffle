import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DeploymentDetail = () => {

    const [jobId, setJobId] = useState("");
    const [deployment, setDeployment] = useState(null);
    const [error, setError] = useState("");
    const params = useParams();


    useEffect(() => {
        if (!params.id) return;
        setJobId(params.id);
        const fetchDeployment = async () => {
            setError("");
            setDeployment(null);
            try {
                const res = await axios.get(`http://localhost:3004/deployments/${params.id}`, { withCredentials: true });
                setDeployment(res.data.deployment);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch deployment");
            }
        };
        fetchDeployment();
    }, [params.id]);


    return (

        <>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            {
                deployment && (
                    <div style={{ marginTop: 16, background: '#f4f4f4', padding: 12, borderRadius: 6 }}>
                        <div><b>Job ID:</b> {deployment.jobid}</div>
                        <div><b>Repo:</b> {deployment.repo}</div>
                        <div
                            className="h-[500px] overflow-scroll w-[700px]"
                            style={{ background: "#111", color: "lime", padding: "10px", fontFamily: "monospace" }}>
                            {deployment.logs.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default DeploymentDetail