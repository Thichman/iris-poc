import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
// Todo: Update layout file with standard dashboard layout and auth protector

export default async function DashboardLayout({ children }) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/sign-in')
    }
    return <>{children}</>;
}