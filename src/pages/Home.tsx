import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Heart, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const { data: content, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="relative aspect-video">
            <Skeleton className="w-full h-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {content?.map((item) => (
        <Link to={`/content/${item.id}`} key={item.id}>
          <Card className="relative group aspect-video overflow-hidden hover:shadow-lg transition-shadow">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{item.price}</span>
                </div>
                <button 
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Like functionality will be implemented later
                  }}
                >
                  <Heart className="w-4 h-4" />
                  <span>{item.likes || 0}</span>
                </button>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}