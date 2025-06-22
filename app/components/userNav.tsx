"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SignoutButton from "./sign-out";

interface iAppProps {
  refid: string | undefined;
  name: string | undefined;
}

export function UserNav({ refid, name }: iAppProps) {
    const handleCopy = () => {
      if (refid) {
        navigator.clipboard.writeText(refid).then(() => {
          toast.info("Referral link copied", {
            description: "You have just copied your referral link."
          })
        }).catch(err => {
          console.error("Failed to copy text: ", err);
        });
      }
    };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ">
          <Avatar className="h-10 w-10  ">
            <AvatarFallback className=" font-bold uppercase ">{name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56  border-[1px]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-row items-start gap-2">
          <Avatar className="h-10 w-10  ">
            <AvatarFallback className=" font-bold uppercase ">{name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 items-start">
          <p className="text-sm leading-none text-content-day font-medium mt-2">
              {name}
            </p>
            <p className="font-semibold uppercase bg-outline-day p-1 rounded-md">{refid}</p>
          </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}