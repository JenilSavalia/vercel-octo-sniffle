import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto">
                <div className="container mx-auto max-w-6xl p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
