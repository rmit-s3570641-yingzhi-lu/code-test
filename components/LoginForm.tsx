'use client';

import { useState } from 'react'

export default function Login() {
    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [token, setToken] = useState('')

    const isDisabled = () => !username || !password;

    const onSubmit = async (e: React.FormEvent) => {
        setError('');
        setSuccess('');
        setToken('');

        e.preventDefault()

        fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if(res?.message){
                    setError(res.message);
                }else{
                    setToken(res?.accessToken);
                    setSuccess('Success Logging In');
                }
            })
            .catch((err) => {
                setError(err ?? 'Error Logging In');
            });
    }

    return (
        <div className="relative flex flex-col items-center p-20 min-h-screen overflow-hidden">
            <div className="w-full p-6 bg-white rounded-md shadow-md lg:max-w-xl">
                <h1 className="text-3xl font-bold text-center text-gray-700">Login</h1>
                <form onSubmit={onSubmit} className="mt-6">
                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="block text-sm font-semibold text-gray-800"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            value={username}
                            onChange={(e: any) => setUserName(e.target.value)}
                            type="email"
                            required
                            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mb-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-800"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            type="password"
                            required
                            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={onSubmit}
                            disabled={isDisabled()}
                            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600 disabled:opacity-50">
                            Login
                        </button>
                    </div>

                    {error && <div className="p-2 mt-5 rounded bg-red-200">{error}</div>}
                    {success && <div className="p-2 mt-5 rounded bg-green-200">{success}</div>}
                    {token && <div className="p-2 mt-5 rounded bg-gray-200 break-words"><p className='font-semibold'>AccessToken:</p>{token}</div>}
                </form>

            </div>
        </div>
    );
}