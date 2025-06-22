import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
   <div className="h-screen w-full flex flex-col p-4 ">
        {/* Nav Bar*/}

    <nav className="flex w-full justify-between items-center">
      <div className="flex gap-1 ">
        <h1 className="md:text-2xl text-xl font-bold">Votras</h1>
        <div className="w-5 h-5 bg-gradient-to-br mt-3 from-pink-300 to-yellow-200 rounded-lg transform rotate-12"></div>
      </div>
      
       {/* Head Writing*/}
       <p className="md:block hidden">Cast Your Votes</p>

      {/* Sign Up*/}
      <div className="flex gap-2">
        <Link href="/sign-in" passHref>
           <Button asChild><p>Login</p></Button>
        </Link>
        <Link href="/sign-up" passHref>
           <Button asChild><p>Sign Up</p></Button>
        </Link>
      </div>
    </nav>

    {/*Hero Content*/}
    <div className="md:p-12 p-5 flex items-center justify-center flex-col">
      <div className="w-full md:max-w-2xl max-w-full text-center">
         <p className="font-bold md:text-5xl text-2xl">
           Make Your Decisions with
           <br />
         <span
        className="block mt-3 text-6xl text-transparent bg-gradient-to-br from-pink-300 to-yellow-200 bg-clip-text"
      >
        Votras
      </span>
        </p>
  </div>
    <div className="max-w-3xl mt-3">
      <p className="text-center">Join Votras—the community-driven platform where your vote counts and your voice matters. Cast your ballot on the issues you care about and dive into thoughtful discussion with fellow members. </p>
    </div>
    <div className="relative w-full md:w-1/2 lg:w-1/3 h-64 sm:h-80 md:h-[58vh] mx-auto overflow-hidden rounded-lg rounded-t-full">
  <Image
    src="https://utfs.io/f/xnMuusLWbTmLlIsDtTDv4D2U78cLk1ZHoYnRx5CGyPgKTfh3"
    alt="Header Image"
    fill
    className="object-cover "
  />
</div>
    </div>
   </div>
  );
}
