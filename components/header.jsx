import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user ? (
        <div className="flex items-center gap-4 right-0">
            Hey, {user.email}!
            <form action={signOutAction}>
                <button type="submit" variant={"outline"}>
                    Sign out
                </button>
            </form>
        </div>
    ) : (
        <div className="flex gap-2 right-0">
            <button asChild size="sm" variant={"outline"}>
                <Link href="/sign-in">Sign in</Link>
            </button>
            <button asChild size="sm" variant={"default"}>
                <Link href="/sign-up">Sign up</Link>
            </button>
        </div>
    );
}
