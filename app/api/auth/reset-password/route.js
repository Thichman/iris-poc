import { NextResponse } from 'next/server';
import { resetPasswordAction } from '@/app/actions';

export async function POST(req) {
    try {
        const formData = await req.formData();
        console.log("Received form data:", formData);
        const result = await resetPasswordAction(formData);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in reset-password:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
