"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError("");
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("password", password);
                formData.append("confirmPassword", confirmPassword);

                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    // On success, redirect the user to the sign-in page or a success screen.
                    router.push("/sign-in");
                } else {
                    const data = await res.json();
                    setError(data.error || "Password update failed.");
                }
            } catch (err) {
                setError("An unexpected error occurred.");
                console.error(err);
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Reset Password</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                    disabled={isPending}
                >
                    {isPending ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}
