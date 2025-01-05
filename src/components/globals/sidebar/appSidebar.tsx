"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChartBarBig,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@clerk/nextjs";

const TEAMS = [
  { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
  { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
  { name: "Evil Corp.", logo: Command, plan: "Free" },
];

const NAV_MAIN = [
  {
    title: "Dashboard",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Team", url: "/dashboard" },
      { title: "Personal", url: "#" },
      { title: "Assigned", url: "#" },
    ],
  },
  {
    title: "Todays Tasks",
    url: "/today-task",
    icon: Bot,
    items: [{ title: "Add", url: "#" }],
  },
  {
    title: "Assign",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Assign Task", url: "#" },
      { title: "Assign Subtask", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
];

const PROJECTS = [
  { name: "Chat", url: "#", icon: ChartBarBig },
  { name: "Sales & Marketing", url: "#", icon: PieChart },
  { name: "Travel", url: "#", icon: Map },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isLoaded, user } = useAuth();

  if (!isLoaded) {
    // Show a loading spinner or placeholder UI
    return <div>Loading...</div>;
  }

  const USER_DATA = {
    name: user?.fullName || "Guest",
    email: user?.emailAddress || "guest@example.com",
    avatar: user?.profileImageUrl || "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={TEAMS} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_MAIN} />
        <NavProjects projects={PROJECTS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
