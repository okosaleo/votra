// app/api/signup/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { signUpSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the incoming JSON payload
    const body = await req.json();
    const data = signUpSchema.parse(body);

    // Create the user via your auth client.
    // Notice that the returned object is a union type where the user is inside newUser.user.
    const newUser = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });
   

    // Return a successful JSON response
    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Sign up error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}