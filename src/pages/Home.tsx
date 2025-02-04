import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "@/components/home/VideoPlayer";
import { ContentInfo } from "@/components/home/ContentInfo";
import { CommentsSection } from "@/components/home/CommentsSection";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

type ContentView = "comments" | "followers";

export default function Home() {
  const [activeView, setActiveView] = useState<ContentView>("comments");
  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const activeContent = content?.find((item) => item.id === activeContentId) || content?.[0];

  return (
    <div className="flex justify-center items-start gap-6 min-h-[calc(100vh-4rem)] p-6 max-w-[1920px] mx-auto">
      {/* Left Card - Content Info */}
      <Card className="w-80 p-4 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm">
        <ContentInfo
          thumbnailUrl={activeContent?.image_url}
          userAvatar="/placeholder.svg"
          username={activeContent?.profiles?.username}
          price={activeContent?.price}
          likes={activeContent?.likes}
        />
      </Card>

      {/* Center - Video Player */}
      <div className="w-[400px] lg:w-[500px] xl:w-[600px]">
        <VideoPlayer videoUrl={activeContent?.image_url} />
      </div>

      {/* Right Card - Comments/Followers */}
      <Card className="w-80 flex flex-col h-[calc(100vh-8rem)] bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm">
        <div className="flex p-4 gap-2 border-b border-secondary/50">
          <Button
            variant={activeView === "comments" ? "default" : "ghost"}
            className="flex-1 group"
            onClick={() => setActiveView("comments")}
          >
            <MessageSquare className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
            Comments
          </Button>
          <Button
            variant={activeView === "followers" ? "default" : "ghost"}
            className="flex-1 group"
            onClick={() => setActiveView("followers")}
          >
            <Users className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
            Followers
          </Button>
        </div>

        <div className="flex-1 p-4">
          {activeView === "comments" && activeContent ? (
            <CommentsSection contentId={activeContent.id} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Followers section coming soon
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}