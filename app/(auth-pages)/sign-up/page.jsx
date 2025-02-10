import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";

export default async function Signup(props) {
  const searchParams = await props.searchParams;
  const hasMessage = "message" in searchParams;

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 p-6">
        {hasMessage ? (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Render any form message if present */}
            <SmtpMessage />
          </div>
        ) : (
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <form className="space-y-4 md:space-y-6">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign up
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
              <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
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
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Company Passcode
                </label>
                <input
                  type="passcode"
                  name="passcode"
                  placeholder="Your passcode"
                  minLength={6}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <button
                  className="w-full text-black bg-blue-500 hover:bg-blue-700 hover:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-400 dark:hover:bg-primary-700 dark:focus:ring-primary-800 hover:bg-primary-300"
                  formAction={signUpAction}
                >
                  Sign up
                </button>
                <div message={searchParams} />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
