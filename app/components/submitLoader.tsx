"use client";
import { Button } from "@/components/ui/button";
import { DoorOpen, Loader2 } from "lucide-react";

export function Submitbutton({ title, pending, onClick, }: { title: string; pending: boolean; onClick?: () => void; }) {
  return (
    <>
      {pending ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please Wait
        </Button>
      ) : (
        <Button type="submit" className="bg-text-button text-destructive-day flex items-center justify-start hover:bg-active-nav w-full"  onClick={onClick}><DoorOpen className="text-destructive-day size-4" /> {title}</Button>
      )}
    </>
  );
}