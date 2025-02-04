import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DollarSign, Heart, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContentInfoProps {
  thumbnailUrl?: string;
  userAvatar?: string;
  username?: string;
  price?: number;
  likes?: number;
  onLike?: () => void;
  onFollow?: () => void;
}

export const ContentInfo = ({
  thumbnailUrl,
  userAvatar,
  username,
  price = 0,
  likes = 0,
  onLike,
  onFollow,
}: ContentInfoProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
    toast.success(isLiked ? "Removed like" : "Added like");
  };

  const handleFollow = () => {
    onFollow?.();
    toast.success("Following user");
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="metallic-card shine-border w-full aspect-square overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Content thumbnail"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
            No thumbnail
          </div>
        )}
      </div>

      <Avatar className="w-16 h-16 border-2 border-primary/20 hover:border-primary/50 transition-colors">
        <AvatarImage src={userAvatar} />
        <AvatarFallback className="bg-secondary text-lg">{username?.[0] ?? "U"}</AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-full animate-pulse-subtle">
        <DollarSign className="w-5 h-5 text-primary" />
        <span className="font-medium text-lg">{price}</span>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          variant={isLiked ? "default" : "secondary"}
          className="w-full group hover:bg-primary/20 transition-colors"
          onClick={handleLike}
        >
          <Heart className={`${isLiked ? "fill-current" : ""} group-hover:scale-110 transition-transform`} />
          <span className="ml-2">{likes}</span>
        </Button>

        <Button
          variant="secondary"
          className="w-full group hover:bg-primary/20 transition-colors"
          onClick={handleFollow}
        >
          <UserPlus className="group-hover:scale-110 transition-transform" />
          <span className="ml-2">Follow</span>
        </Button>
      </div>
    </div>
  );
};