import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Heart, Flag, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ContentDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: content } = useQuery({
    queryKey: ["content", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("content_id", id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${id}`
        },
        () => {
          refetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchComments]);

  const handleComment = async () => {
    if (!comment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to comment",
      });
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert({
        content_id: id!,
        message: comment,
        user_id: user.id
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment",
      });
      return;
    }

    setComment("");
  };

  if (!content) return null;

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen">
      <div className="relative">
        <img
          src={content.image_url}
          alt={content.title}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <DollarSign />
            <span className="text-lg font-bold">{content.price}</span>
          </div>
          <Button variant="ghost" className="text-white hover:text-red-500">
            <Heart className="w-6 h-6" />
            <span className="ml-2">{content.likes || 0}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <Card className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
          <p className="text-muted-foreground mb-6">{content.description}</p>

          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Comments</h2>
            </div>

            <div className="space-y-4 mb-4">
              {comments?.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <p>{comment.message}</p>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button onClick={handleComment}>Post</Button>
            </div>
          </div>
        </Card>

        <Button
          variant="outline"
          className="mt-4 gap-2"
          onClick={() => {
            toast({
              title: "Content Reported",
              description: "Thank you for your report. We will review it shortly.",
            });
          }}
        >
          <Flag className="w-4 h-4" />
          Report Content
        </Button>
      </div>
    </div>
  );
}