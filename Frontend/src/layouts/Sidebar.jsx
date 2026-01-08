import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LayoutDashboard, Plus, Box, Layers, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ className }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', to: '/dashboard' },
        { icon: Box, label: 'Projects', to: '/projects' }, // Placeholder
        // { icon: Layers, label: 'Integrations', to: '/integrations' }, // Placeholder
        { icon: Settings, label: 'Settings', to: '/settings' }, // Placeholder
    ];

    return (
        <div className={cn("w-64 border-r border-gray-800 bg-black flex flex-col h-screen sticky top-0", className)}>
            <div className="p-6">
                {/* Logo placeholder */}
                <div className="flex items-center gap-2 font-bold text-xl text-white mb-8">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                    Render
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-[#222] text-white"
                                        : "text-gray-400 hover:text-white hover:bg-[#111]"
                                )
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-8">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Create New
                    </h3>
                    <nav className="space-y-1">
                        <NavLink
                            to="/static/new"
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive ? "bg-[#222] text-white" : "text-gray-400 hover:text-white hover:bg-[#111]"
                                )
                            }
                        >
                            <Plus className="w-4 h-4" />
                            New Static Site
                        </NavLink>
                        {/* <NavLink
                            to="/web/new"
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive ? "bg-[#222] text-white" : "text-gray-400 hover:text-white hover:bg-[#111]"
                                )
                            }
                        >
                            <Plus className="w-4 h-4" />
                            New Web Service
                        </NavLink> */}
                    </nav>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-gray-800">
                {/* User profile / Logout placeholder */}
                <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white w-full rounded-md hover:bg-[#111] transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
