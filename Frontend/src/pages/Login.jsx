import React from 'react';
import { Button } from '../Components/ui/Button';
import { Input } from '../Components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/Card';
import { Github, Gitlab, Trello, Chrome } from 'lucide-react'; // Using proxies for icons not always in lucide

const Login = () => {
    const handleLogin = () => {
        window.location.href = "http://localhost:3004/login";
    };

    return (
        <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Sign In to Render</h1>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <Button variant="secondary" className="h-12 bg-[#111] border-[#333] hover:bg-[#222]" onClick={handleLogin}>
                        <Github className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" className="h-12 bg-[#111] border-[#333] hover:bg-[#222]">
                        <Gitlab className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" className="h-12 bg-[#111] border-[#333] hover:bg-[#222]">
                        <Trello className="h-5 w-5" />
                        {/* Bitbucket proxy */}
                    </Button>
                    <Button variant="secondary" className="h-12 bg-[#111] border-[#333] hover:bg-[#222]">
                        <Chrome className="h-5 w-5" />
                        {/* Google proxy */}
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#333]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#000] px-2 text-gray-500">or</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <Input placeholder="your@email.com" className="h-12 border-[#333] bg-[#0a0a0a] focus:border-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Password</label>
                        <Input type="password" placeholder="••••••••" className="h-12 border-[#333] bg-[#0a0a0a] focus:border-white transition-colors" />
                    </div>

                    <Button className="w-full h-12 text-base bg-white text-black hover:bg-gray-200" onClick={handleLogin}>
                        Sign in
                    </Button>
                </div>

                <div className="space-y-2 text-center text-sm">
                    <p className="text-gray-500 hover:text-white cursor-pointer transition-colors">Sign in with SSO</p>
                    <p className="text-gray-500 hover:text-white cursor-pointer transition-colors">Need an account? <span className="text-blue-500">Sign up</span></p>
                    <p className="text-gray-500 hover:text-white cursor-pointer transition-colors">Forgot your password? <span className="text-blue-500">Reset it</span></p>
                </div>

            </div>
        </div>
    );
};

export default Login;
