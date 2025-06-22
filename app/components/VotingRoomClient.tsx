'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share2, Users, CheckCircle, MessageSquare,  Check, Timer, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

// Type definitions
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface Option {
  id: string;
  title: string;
  description: string | null;
  order: number;
  votes: number;
  _count?: { votes: number };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  replies: Comment[];
}

interface RoomData {
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

interface VotingRoomClientProps {
  initialData: RoomData;
  currentUser: User | null;
  isCreator: boolean;
}

export default function VotingRoomClient({ 
  initialData, 
  currentUser, 
  isCreator 
}: VotingRoomClientProps) {
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [roomData, setRoomData] = useState<RoomData>(initialData);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [showJustification, setShowJustification] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialData.comments);
  const [newComment, setNewComment] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Generate guest ID for anonymous users
  useEffect(() => {
    if (!currentUser) {
      const fingerprint = generateGuestFingerprint();
      setGuestId(fingerprint);
    }
  }, [currentUser]);

  // Update time remaining every minute
  useEffect(() => {
    const updateTimeRemaining = () => {
      const deadline = new Date(roomData.votingDeadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Voting closed");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [roomData.votingDeadline]);

  const generateGuestFingerprint = (): string => {
    // Simple fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Guest fingerprint', 2, 2);
    }
    
    const canvasData = canvas.toDataURL();
    const screenData = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const timezone = new Date().getTimezoneOffset();
    const language = navigator.language;
    
    // Simple hash
    let hash = 0;
    const str = canvasData + screenData + timezone + language;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36) + Date.now().toString(36);
  };

  const isVotingActive = (): boolean => {
    const deadline = new Date(roomData.votingDeadline);
    const now = new Date();
    return roomData.isActive && now < deadline;
  };

  const getTotalVotes = (): number => {
    return roomData.options.reduce((total, option) => total + option.votes, 0);
  };

  const getVotePercentage = (votes: number): number => {
    const total = getTotalVotes();
    return total > 0 ? (votes / total) * 100 : 0;
  };

  const handleVote = async (optionId: string) => {
    if (!isVotingActive() || roomData.hasVoted || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/rooms/${roomData.slug}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          justification: showJustification ? justification : null,
          guestFingerprint: !currentUser ? guestId : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cast vote');
      }

      // Update local state
      setRoomData(prev => ({
        ...prev,
        hasVoted: true,
        userVote: optionId,
        options: prev.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, votes: opt.votes + 1 }
            : opt
        )
      }));
      
      setSelectedOption(null);
      setShowJustification(false);
      setJustification('');
      
      toast.success('Your vote has been recorded!');
      
      // Refresh the page to get updated data
      router.refresh();
      
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error((error as Error).message || 'Failed to cast vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/room/${roomData.slug}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: roomData.title,
          text: roomData.description,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to share:', err);
      toast.error('Failed to share link');
    }
  };

  const handleComment = async () => {
  if (!newComment.trim()) return;

  setIsPosting(true);

  try {
    const response = await fetch(`/api/rooms/${roomData.slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment,
        guestFingerprint: !currentUser ? guestId : null
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const result = await response.json();

    setComments(prev => [
      {
        ...result.comment,
        authorName: currentUser?.name || 'Anonymous Guest',
        replies: [],
      },
      ...prev,
    ]);

    setNewComment('');
    toast.success('Comment posted!');
  } catch (error) {
    console.error('Error posting comment:', error);
    toast.error('Failed to post comment');
  } finally {
    setIsPosting(false);
  }
};


  const canVote = isVotingActive() && !roomData.hasVoted && (currentUser || roomData.allowGuestVoting);
  const showResults = roomData.showLiveResults || !isVotingActive() || roomData.hasVoted;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{roomData.title}</h1>
            <p className="text-gray-600 max-w-2xl">{roomData.description}</p>
          </div>
          <div className='flex flex-col gap-2'>
          <Button 
            onClick={handleShare}
            variant="outline" 
            className="flex items-center gap-2"
          >
            {urlCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {urlCopied ? 'Copied!' : 'Share'}
          </Button>
           <Link href="/dashboard" className='text-xs py-2 px-1.5 border-1 rounded-md'>Voting rooms</Link>
           </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{getTotalVotes()} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
          {isCreator && (
            <Badge variant="secondary">Room Creator</Badge>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {!isVotingActive() && (
        <Alert>
          <AlertDescription>
            Voting has ended. Final results are displayed below.
          </AlertDescription>
        </Alert>
      )}

      {roomData.hasVoted && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            Your vote has been recorded! {roomData.showLiveResults ? 'Results are updated in real-time.' : 'Results will be shown when voting ends.'}
          </AlertDescription>
        </Alert>
      )}

      {!currentUser && roomData.allowGuestVoting && canVote && (
        <Alert>
          <AlertDescription>
            You&apos;re voting as a guest. Your vote is anonymous and secure.
          </AlertDescription>
        </Alert>
      )}

      {/* Voting Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Voting Options</h2>
        <div className="grid gap-4">
          {roomData.options.map((option) => (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOption === option.id ? 'ring-2 ring-blue-500' : ''
              } ${roomData.userVote === option.id ? 'bg-green-50 border-green-200' : ''}`}
              onClick={() => canVote && setSelectedOption(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      {roomData.userVote === option.id && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    {option.description && (
                      <p className="text-gray-600 mb-3">{option.description}</p>
                    )}
                    
                    {showResults && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {option.votes} vote{option.votes !== 1 ? 's' : ''}
                          </span>
                          <span className="font-medium">
                            {getVotePercentage(option.votes).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={getVotePercentage(option.votes)} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Vote Justification */}
      {selectedOption && canVote && roomData.allowVoteJustification && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optional: Explain Your Choice</CardTitle>
            <CardDescription>
              Share why you chose this option (this will be anonymous)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showJustification"
                checked={showJustification}
                onChange={(e) => setShowJustification(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showJustification" className="text-sm">
                Add explanation for my vote
              </label>
            </div>
            
            {showJustification && (
              <Textarea
                placeholder="Why did you choose this option?"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="min-h-[100px]"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Vote Button */}
      {selectedOption && canVote && (
        <div className="flex justify-center">
          <Button 
            onClick={() => handleVote(selectedOption)}
            size="lg"
            className="px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Casting Vote...' : 'Cast Vote'}
          </Button>
        </div>
      )}

      {/* Discussion Section */}
      {roomData.allowDiscussion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Share your thoughts about this decision..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleComment} disabled={!newComment.trim() || isPosting}>
                   {isPosting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                        'Post'
                            )}
               </Button>

            </div>
            
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}