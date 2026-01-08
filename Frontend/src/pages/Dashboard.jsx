import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '../Components/ui/Button';
import { Input } from '../Components/ui/Input';
import { Card, CardContent } from '../Components/ui/Card';
import { StatusBadge } from '../Components/ui/StatusBadge';
import { Search, Plus, MoreHorizontal, Globe } from 'lucide-react';

const Dashboard = () => {
    const [deployments, setDeployments] = useState([]);
    const [deploymentsError, setDeploymentsError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllDeployments = async () => {
        setDeploymentsError("");
        setDeployments([]);
        setIsLoading(true);
        try {
            const res = await axios.get("http://localhost:3004/deployments", { withCredentials: true });
            setDeployments(res.data.deployments || []);
        } catch (err) {
            setDeploymentsError(err.response?.data?.error || "Failed to fetch deployments");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllDeployments()
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Overview</h1>
                <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                </Button>
            </div>

            {/* Projects Section - Placeholder matching screenshot */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-dashed border-gray-700 bg-transparent hover:bg-[#111] transition-colors cursor-pointer flex items-center justify-center p-8 group">
                        <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-300">
                            <Plus className="w-5 h-5" />
                            <span>Create new project</span>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Ungrouped Services */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Ungrouped Services</h2>
                    <div className="flex gap-2">
                        {/* Filters placeholders */}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input placeholder="Search services..." className="pl-9" />
                    </div>

                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-4">Service Name</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Runtime</div>
                        <div className="col-span-2">Region</div>
                        <div className="col-span-2 text-right">Created</div>
                    </div>

                    {deploymentsError && <div className="text-red-500 text-sm px-6">{deploymentsError}</div>}

                    {/* Deployments List */}
                    <div className="space-y-px bg-gray-800 rounded-lg overflow-hidden border border-gray-800">
                        {isLoading ? (
                            <div className="bg-[#0A0A0A] p-8 text-center text-gray-500">Loading...</div>
                        ) : deployments.length > 0 ? (
                            deployments.map((dep, i) => (
                                <Link to={`/deployment/${dep.jobid}`} key={i} className="block">
                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0A0A0A] items-center hover:bg-[#111] transition-colors group">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-md">
                                                <Globe className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{dep.repo?.split('/').pop() || 'Unknown Repo'}</div>
                                                <div className="text-xs text-gray-500">{dep.repo}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <StatusBadge status="Deployed" /> {/* Mock status for now as API might not return it explicitly properly yet, using badge */}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-400">Static</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-400">Oregon</span>
                                        </div>
                                        <div className="col-span-2 text-right flex items-center justify-end gap-2">
                                            <span className="text-sm text-gray-400">2d ago</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="bg-[#0A0A0A] p-8 text-center text-gray-500">No services found</div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
