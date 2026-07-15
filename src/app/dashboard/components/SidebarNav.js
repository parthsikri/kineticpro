"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, Settings, History } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Generator", href: "/dashboard", icon: LayoutDashboard },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "My Assets", href: "/dashboard/assets", icon: ImageIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors group ${
              isActive 
                ? "bg-white/5 text-white" 
                : "text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-gold" : "group-hover:text-gold"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
