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
          <div key={i} className="metallic-card shine-border aspect-video">
            <Skeleton className="w-full h-full bg-secondary/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {content?.map((item) => (
        <Link to={`/content/${item.id}`} key={item.id}>
          <div className="group relative">
            <div className="metallic-card shine-border aspect-video overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                  <Image className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="absolute top-4 left-4 z-10">
                <Avatar className="w-8 h-8 border-2 border-primary/20 shadow-lg">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-secondary">U</AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">{item.price}</span>
                  </div>
                  <button 
                    className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full hover:bg-primary/50 transition-colors"
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
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
