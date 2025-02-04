import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface CommentsSectionProps {
  contentId: string;
}

export const CommentsSection = ({ contentId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("content_id", contentId)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Failed to load comments");
        return;
      }

      setComments(data || []);
    };

    fetchComments();

    const channel = supabase
      .channel("comments-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `content_id=eq.${contentId}`,
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      content_id: contentId,
      message: newComment.trim(),
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to post comment");
      return;
    }

    setNewComment("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                <p className="text-sm">{comment.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};