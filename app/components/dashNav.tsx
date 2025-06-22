import { UserNav } from "./userNav";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";


async function getData(userId: string) {
  const user  = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    })
  return user;
}

export default async function Navbar() {
  
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if(!session || session == null) {
    redirect("/sign-in");
  }

  const user = await getData(session.user.id);
  return (
    <nav className=" flex justify-between items-center">
        <div className=" relative flex justify-between gap-7 pr-4 items-center flex-row">
        <ThemeToggle />
          <div className="h-10 w-10 rounded-full flex items-center justify-center ">
            <UserNav refid={user?.id.slice(0, 8)} name={user?.name}   />
          </div>

        </div>
    </nav>
  )
}
