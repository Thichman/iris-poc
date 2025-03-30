'use client';

import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { useSearchParams } from "next/navigation";
import { forgotPasswordAction } from "@/app/actions";

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="h-full flex w-full flex-col items-center justify-center space-y-10">
      <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form className="space-y-4 md:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Reset Password
            </h1>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                href="/sign-in"
              >
                Sign in
              </Link>
            </p>
            <div className="flex flex-col gap-2 mt-8">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                name="email"
                placeholder="you@example.com"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <button
                type="submit"
                formAction={forgotPasswordAction()}
                className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition"
              >
                Reset Password
              </button>
              {message && <p className="text-green-600 text-center">{message}</p>}
            </div>
          </form>
        </div>
      </div>
      <SmtpMessage />
    </div>
  );
}
