import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../Components/SearchableDropdown';
import Logs from '../Components/Logs';
import { Button } from '../Components/ui/Button';
import { Input } from '../Components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/Card';
import { Github, Play } from 'lucide-react';

export default function DeployNewStatic() {
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
            // ... polling logic logic same as before but ensuring URL is correct
            try {
                const response = await fetch(`http://localhost:3000/api/status?id=${jobId}`);
                const data = await response.json();

                setStatus(data.status);
                setStatusMessage(data.message || '');

                if (data.status === 'deployed' || data.status === 'failed') {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Error polling status:', error);
                setStatusMessage('Error fetching status');
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [jobId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('processing');
        setStatusMessage('Submitting repository...');

        try {
            const response = await fetch('http://localhost:3000/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl: repoUrl || selectedRepo?.value, deploymentName }),
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

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Deploy New Static Site</h1>
                <p className="text-gray-500">Connect a GitHub repository to deploy your static website.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Repository Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">GitHub Repository</label>
                        {/* Keeping original SearchableDropdown for now as it has specific logic, just wrapping it or ensuring it looks okay */}
                        <div className="bg-[#111] border border-[#333] rounded-md p-1">
                            <SearchableDropdown selectedRepo={selectedRepo} setSelectedRepo={setSelectedRepo} />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#333]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0A0A0A] px-2 text-gray-500">or enter manually</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Repository URL</label>
                        <Input
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Project Name</label>
                        <Input
                            value={deploymentName}
                            onChange={(e) => setDeploymentName(e.target.value)}
                            placeholder="my-awesome-project"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !deploymentName || !(repoUrl || selectedRepo?.value)}
                        className="w-full h-12 text-base"
                    >
                        {isSubmitting ? 'Deploying...' : 'Deploy'}
                        {!isSubmitting && <Play className="ml-2 w-4 h-4" />}
                    </Button>
                </CardContent>
            </Card>

            {/* Status Card */}
            {status !== 'idle' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Deployment Status
                            <span className={`text-sm font-normal px-2 py-1 rounded bg-white/10 ${status === 'failed' ? 'text-red-500' : 'text-green-500'}`}>
                                {status.toUpperCase()}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 mb-4">{statusMessage}</p>

                        {jobId && <Logs uploadId={jobId} />}

                        {status === 'deployed' && (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <a href={`http://${jobId}.localhost:3003`} target="_blank" rel="noreferrer" className="text-green-500 hover:underline flex items-center gap-2">
                                    Visit Live Site <span className="text-xl">↗</span>
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
