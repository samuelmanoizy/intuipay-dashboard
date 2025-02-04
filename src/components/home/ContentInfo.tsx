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
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
            No thumbnail
          </div>
        )}
      </div>

      <Avatar className="w-12 h-12 border-2 border-primary/20">
        <AvatarImage src={userAvatar} />
        <AvatarFallback>{username?.[0] ?? "U"}</AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2 bg-secondary/80 px-3 py-1.5 rounded-full">
        <DollarSign className="w-4 h-4" />
        <span className="font-medium">{price}</span>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          variant={isLiked ? "default" : "secondary"}
          className="w-full"
          onClick={handleLike}
        >
          <Heart className={isLiked ? "fill-current" : ""} />
          <span>{likes}</span>
        </Button>

        <Button variant="secondary" className="w-full" onClick={handleFollow}>
          <UserPlus />
          <span>Follow</span>
        </Button>
      </div>
    </div>
  );
};