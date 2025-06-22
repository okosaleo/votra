// types.ts - Add proper type definitions
export interface VotingOption {
  id: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: Date;
  roomId: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  guestId: string | null;
  roomId: string;
  parentId: string | null;
  replies?: Comment[];
}

export interface RoomData {
  id: string;
  title: string;
  description: string;
  slug: string;
  votingDeadline: Date;
  isActive: boolean;
  allowGuestVoting: boolean;
  allowVoteJustification: boolean;
  allowDiscussion: boolean;
  showLiveResults: boolean;
  hasVoted: boolean;
  userVote: string | null;
  options: Option[];
  comments: Comment[];
}

interface Option {
  id: string;
  title: string;
  description: string | null;
  order: number;
  votes: number;
  _count?: { votes: number };
}