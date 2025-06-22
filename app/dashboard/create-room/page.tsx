import { CreateRoomForm } from "@/app/components/CreateRoomForm";


export default function CreateRoom() {
  return (
    <div className="p-6 flex flex-col  w-full">
        <div className="flex items-center md:justify-center justify-start w-full">
           <h1 className="md:text-5xl text-2xl font-bold">Create a Decision Room</h1>
        </div>
        <CreateRoomForm />
    </div>
  )
}
