import { useState, useEffect } from 'react';

import SearchableDropdown from './Components/SearchableDropdown';
import Logs from './Components/Logs';

export default function Home() {
    const [repoUrl, setRepoUrl] = useState('');
    const [deploymentName, setDeploymentName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [jobId, setJobId] = useState(null);

    const [selectedRepo, setSelectedRepo] = useState(null);


    // Poll API for status updates
    useEffect(() => {
        if (!jobId) return;

        const pollInterval = setInterval(async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch(`http://localhost:3000/api/status?id=${jobId}`);
                const data = await response.json();

                setStatus(data.status);
                setStatusMessage(data.message || '');

                // Stop polling if job is complete or failed
                if (data.status === 'deployed' || data.status === 'failed') {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Error polling status:', error);
                setStatusMessage('Error fetching status');
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [jobId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('processing');
        setStatusMessage('Submitting repository...');

        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:3000/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl, deploymentName }),
                credentials: 'include',
            });

            const data = await response.json();
            setJobId(data.id);
            setStatusMessage('Repository submitted successfully');
        } catch (error) {
            console.error('Error submitting:', error);
            setStatus('failed');
            setStatusMessage('Failed to submit repository');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'idle':
                return 'bg-gray-100 text-gray-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  py-12 px-4">


            <div className="flex flex-col items-center justify-center gap-5">

                <div className="w-2xl">
                    <SearchableDropdown selectedRepo={selectedRepo} setSelectedRepo={setSelectedRepo} />
                </div>

                <div className="min-w-2xl  mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <h1 className="text-xl font-bold text-gray-900">
                            GitHub Repository Submission
                        </h1>
                        <p className="text-gray-60 text-sm mb-8">
                            Enter a GitHub repository URL to process
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Deployment Name
                                </label>
                                <input
                                    type="text"
                                    id="repoUrl"
                                    value={deploymentName || ""}
                                    onChange={(e) => setDeploymentName(e.target.value)}
                                    placeholder="vercel-octa-core"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Repository URL
                                </label>
                                <input
                                    type="text"
                                    id="repoUrl"
                                    value={repoUrl || selectedRepo?.value || ""}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    placeholder="https://github.com/username/repository"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !deploymentName || !(repoUrl || selectedRepo?.value)}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Repository'}
                            </button>
                        </div>

                        {/* Status Section */}
                        {status !== 'idle' && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Status
                                </h2>

                                <div className={`rounded-lg p-4 ${getStatusColor()}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold capitalize">{status}</span>
                                        {status === 'processing' && (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                                        )}
                                    </div>
                                    {statusMessage && (
                                        <p className="text-sm">{statusMessage}</p>
                                    )}
                                </div>


                                {jobId && (
                                    <>
                                        <p className="text-sm text-gray-500 mt-3">
                                            Job ID: <span className="font-mono">{jobId}</span>
                                        </p>
                                        <div className="mt-4">
                                            <Logs uploadId={jobId} />
                                        </div>
                                    </>
                                )}

                                {status === 'deployed' && (
                                    <div className="h-5 w-5 border-current">
                                        <a href={`http://${jobId}.localhost:3003`}>
                                            {`http://${jobId}.localhost:3003`}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}