import { auth } from "@/auth"; // adjust the import based on your project structure
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function currentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}
