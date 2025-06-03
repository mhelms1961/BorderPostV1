import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Video,
  Settings,
  Users,
  FileText,
  HelpCircle,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          active ? "bg-gray-100" : "hover:bg-gray-100",
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
}

export default function Sidebar() {
  // In a real app, you'd determine the active route from router state
  const activePath = window.location.pathname;

  return (
    <div className="fixed top-16 left-0 bottom-0 w-64 border-r border-gray-200 bg-white p-4">
      <div className="space-y-1">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          href="/dashboard"
          active={activePath === "/dashboard"}
        />
        <SidebarItem
          icon={<Video className="h-5 w-5" />}
          label="My Videos"
          href="/videos"
          active={activePath === "/videos"}
        />
        <SidebarItem
          icon={<FileText className="h-5 w-5" />}
          label="Templates"
          href="/templates"
          active={activePath === "/templates"}
        />
        <SidebarItem
          icon={<Users className="h-5 w-5" />}
          label="Team"
          href="/team"
          active={activePath === "/team"}
        />
      </div>

      <div className="absolute bottom-8 left-4 right-4 space-y-1">
        <SidebarItem
          icon={<HelpCircle className="h-5 w-5" />}
          label="Help & Support"
          href="/support"
          active={activePath === "/support"}
        />
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          href="/settings"
          active={activePath === "/settings"}
        />
      </div>
    </div>
  );
}
