import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, BarChart2, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

async function getDecisionRooms() {
  return await prisma.decisionRoom.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      createdAt: true,
      votingDeadline: true,
      isActive: true,
      creator: {
        select: {
          name: true,
        }
      },
      _count: {
        select: {
          votes: true,
          options: true
        }
      }
    }
  });
}


type RoomCardProps = {
  id: string;
  title: string;
  description: string;
  slug: string;
  createdAt: Date;
  votingDeadline: Date;
  isActive: boolean;
  creator: {
    name: string | null;
  };
  _count: {
    votes: number;
    options: number;
  };
};

export default async function RoomsPage() {
  const rooms = await getDecisionRooms();

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Decision Rooms</h1>
          <p className="text-muted-foreground mt-2">
            Active and completed voting sessions
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create-room">
            Create New Room
          </Link>
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-semibold">No decision rooms yet</h2>
          <p className="text-muted-foreground mt-2">
            Create your first room to start collecting votes
          </p>
          <Button className="mt-4" asChild>
            <Link href="/create">
              Create Room
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room }: { room: RoomCardProps }) {
  const isActive = room.isActive && new Date() < room.votingDeadline;
  const status = isActive ? "Active" : "Completed";
  const statusColor = isActive ? "text-green-600" : "text-gray-500";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{room.title}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {room.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">
              <span className="font-medium">Creator:</span> {room.creator.name || "Unknown"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">
              <span className="font-medium">Created:</span> {format(room.createdAt, "MMM d, yyyy")}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">
              <span className="font-medium">Deadline:</span> {format(room.votingDeadline, "MMM d, yyyy HH:mm")}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-4">
              <p className="text-sm">
                <span className="font-medium">Votes:</span> {room._count.votes}
              </p>
              <p className="text-sm">
                <span className="font-medium">Options:</span> {room._count.options}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <span className={`text-sm font-medium ${statusColor}`}>
          {status}
        </span>
        <Button size="sm" asChild>
          <Link href={`/room/${room.slug}`}>
            {isActive ? "Vote Now" : "View Results"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}