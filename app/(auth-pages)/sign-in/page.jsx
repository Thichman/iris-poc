import { signInAction } from "@/app/actions";
import Link from "next/link";

export default async function Login(props) {
  const searchParams = await props.searchParams;
  return (
    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 p-6 items-center align-middle">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <form className="space-y-4 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Sign in</h1>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8 items-center justify-center">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
            <input name="email" placeholder="you@example.com" required className="bg-gray-50 h-12 text-lg border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            <div className="flex justify-between items-center space-x-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <Link
                className="text-xs text-foreground underline mb-2"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Your password"
              required
              className="bg-gray-50 h-12 p-2.5 border text-lg border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" formAction={signInAction}>
              Sign in
            </button>
            <div message={searchParams} />
          </div>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-primary-600 hover:underline dark:text-primary-500 hover:cursor-pointer" href="/sign-up">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
