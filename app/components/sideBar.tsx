import { CirclePlus, Home} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export const navLinks = [
  {
    name: 'Decision Rooms',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Create a Decision Room',
    href: '/dashboard/create-room',
    icon: CirclePlus
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="">
       <SidebarHeader className="flex justify-center items-center border-b-[1px] mb-5 border-b-outline-day">
           <div className="flex gap-1 p-[2px] justify-center items-center">
        <h1 className="md:text-2xl text-xl font-bold">Votras</h1>
        <div className="w-3 h-3 bg-gradient-to-br  from-pink-300 to-yellow-200 rounded-lg transform rotate-12"></div>
        </div>
        </SidebarHeader>
        <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex gap-3">
              {navLinks.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild className="flex ">
                    <Link href={item.href} className="text-primary flex gap-3">
                      <item.icon className="size-7 font-medium" />
                      <span className="text-base font-medium">{item.name}</span>
                    </Link>                 
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  )
}
