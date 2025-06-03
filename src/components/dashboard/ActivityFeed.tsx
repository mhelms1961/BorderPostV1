import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
  type: "upload" | "edit" | "download" | "share";
}

export default function ActivityFeed() {
  // Sample activity data
  const activities: Activity[] = [
    {
      id: "1",
      user: {
        name: "John Doe",
        avatar: "john",
        initials: "JD",
      },
      action: "uploaded",
      target: "Wedding_Final_v2.mp4",
      time: "2 minutes ago",
      type: "upload",
    },
    {
      id: "2",
      user: {
        name: "Sarah Smith",
        avatar: "sarah",
        initials: "SS",
      },
      action: "added border to",
      target: "Client_Highlight.mp4",
      time: "1 hour ago",
      type: "edit",
    },
    {
      id: "3",
      user: {
        name: "Mike Johnson",
        avatar: "mike",
        initials: "MJ",
      },
      action: "downloaded",
      target: "Beach_Wedding_Final.mp4",
      time: "3 hours ago",
      type: "download",
    },
    {
      id: "4",
      user: {
        name: "Emily Chen",
        avatar: "emily",
        initials: "EC",
      },
      action: "shared",
      target: "Anniversary_Video.mp4",
      time: "Yesterday",
      type: "share",
    },
  ];

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "upload":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Upload
          </Badge>
        );
      case "edit":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Edit
          </Badge>
        );
      case "download":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Download
          </Badge>
        );
      case "share":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Share
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Recent Activity</h3>
      <div className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user.avatar}`}
                alt={activity.user.name}
              />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                {activity.action}{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">{activity.time}</p>
                {getActivityBadge(activity.type)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
