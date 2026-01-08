import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../Components/ui/Button';
import { Card } from '../Components/ui/Card';
import { StatusBadge } from '../Components/ui/StatusBadge';
import { ArrowLeft, ExternalLink, RefreshCw, Terminal, Clock, GitCommit } from 'lucide-react';

const DeploymentDetail = () => {
    const [deployment, setDeployment] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();

    const fetchDeployment = async () => {
        setError("");
        setIsLoading(true);
        // setDeployment(null); // Keep previous data while reloading for better UX
        try {
            const res = await axios.get(`http://localhost:3004/deployments/${params.id}`, { withCredentials: true });
            setDeployment(res.data.deployment);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch deployment");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchDeployment();
        }
    }, [params.id]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <div className="text-red-500 font-medium">{error}</div>
                <Button onClick={fetchDeployment} variant="secondary">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        )
    }

    if (isLoading && !deployment) {
        return <div className="p-8 text-center text-gray-500">Loading deployment details...</div>;
    }

    if (!deployment) return null;

    return (
        <div className="space-y-6">
            {/* Breadcrumb / Header */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-white font-medium">{deployment.jobid}</span>
            </div>

            {/* Title Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {deployment.repo?.split('/').pop() || 'Unknown Service'}
                        <StatusBadge status="Deployed" />
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <a href={deployment.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                            <GitCommit className="w-4 h-4" />
                            {deployment.repo}
                        </a>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Deployed just now
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Redeploy
                    </Button>
                    <Button variant="primary" asChild>
                        <a href={`http://${deployment.jobid}.localhost:3003`} target="_blank" rel="noreferrer">
                            Visit Site <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                </div>
            </div>

            {/* Logs Viewer */}
            <Card className="flex flex-col bg-[#050505] border-[#333] overflow-hidden min-h-[500px]">
                <div className="px-4 py-2 border-b border-[#333] flex items-center justify-between bg-[#111]">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Terminal className="w-4 h-4" />
                        <span>Build Logs</span>
                    </div>
                </div>
                <div className="p-4 font-mono text-sm overflow-auto flex-1 h-[500px] text-gray-300">
                    {deployment.logs && deployment.logs.length > 0 ? (
                        deployment.logs.map((line, i) => (
                            <div key={i} className="py-0.5 hover:bg-white/5 px-2 -mx-2 rounded">
                                <span className="text-gray-600 select-none mr-4 text-xs w-8 inline-block text-right">{i + 1}</span>
                                {line}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-600 italic">No logs available for this deployment.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DeploymentDetail;
