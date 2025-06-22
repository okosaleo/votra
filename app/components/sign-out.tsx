"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/auth-client";
import { useState } from "react";
import { Submitbutton } from "./submitLoader";

export default function SignoutButton() {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	const handleSignOut = async () => {
		try {
			setPending(true);
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/sign-in");
						router.refresh();
					},
				},
			});
		} catch (error) {
			console.error("Error signing out:", error);
		} finally {
			setPending(false);
		}
	};

	return (	
		<Submitbutton pending={pending} onClick={handleSignOut} title="Logout" />
	);
}