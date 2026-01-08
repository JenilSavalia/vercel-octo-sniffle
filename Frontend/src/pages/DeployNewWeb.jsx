import React, { useState } from 'react';
import { Button } from '../Components/ui/Button';
import { Input } from '../Components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/Card';
import { Play } from 'lucide-react';

export default function DeployNewWeb() {
    // Boilerplate for Web Service deployment (placeholder logic mostly similar to static)
    const [image, setImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Mock submission
        setTimeout(() => setIsSubmitting(false), 2000);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Deploy New Web Service</h1>
                <p className="text-gray-500">Deploy a Docker container as a web service.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                        Web Services are currently in beta. Support is limited to public Docker images.
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Docker Image URL</label>
                        <Input
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="docker.io/library/nginx:latest"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Environment Variables</label>
                        <div className="p-8 border border-dashed border-[#333] rounded-lg text-center text-gray-500 text-sm">
                            Key-Value pair editor coming soon
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !image}
                        className="w-full h-12 text-base"
                    >
                        {isSubmitting ? 'Deploying...' : 'Deploy'}
                        {!isSubmitting && <Play className="ml-2 w-4 h-4" />}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
