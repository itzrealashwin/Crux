import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Briefcase, 
  XCircle, 
  Clock, 
  User, 
  Phone,
  ArrowUpRight,
  ArrowRight,
  Loader2,
  Bell
} from "lucide-react";

// UI Components
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

// Hooks
import { 
  useNotifications, 
  useNotificationMutations 
} from "@/features/notifications/hooks/useNotifications.js";

const FILTERS = ["All", "Unread", "Applications", "New drives", "Deadlines", "Offers", "Profile"];

const typeConfig = {
  "OFFER": {
    icon: Check,
    iconClass: "text-amber-500 bg-amber-500/10",
    badgeLabel: "Offer received",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    containerClass: "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10",
  },
  "SHORTLISTED": {
    icon: CheckCircle2,
    iconClass: "text-emerald-500 bg-emerald-500/10",
    badgeLabel: "Shortlisted",
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "TIMELINE_UPDATE": {
    icon: Calendar,
    iconClass: "text-blue-500 bg-blue-500/10",
    badgeLabel: "Timeline update",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "INTERVIEW": {
    icon: Users,
    iconClass: "text-indigo-500 bg-indigo-500/10",
    badgeLabel: "Interview",
    badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "NEW_DRIVE": {
    icon: Briefcase,
    iconClass: "text-purple-500 bg-purple-500/10",
    badgeLabel: "New drive",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "REJECTED": {
    icon: XCircle,
    iconClass: "text-red-500 bg-red-500/10",
    badgeLabel: "Not selected",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "DEADLINE_SOON": {
    icon: Clock,
    iconClass: "text-orange-500 bg-orange-500/10",
    badgeLabel: "Deadline soon",
    badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "PROFILE": {
    icon: User,
    iconClass: "text-muted-foreground bg-muted",
    badgeLabel: "Profile",
    badgeClass: "bg-muted text-muted-foreground border-border/50",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "SYSTEM": {
    icon: Phone,
    iconClass: "text-muted-foreground bg-muted",
    badgeLabel: "System",
    badgeClass: "bg-muted text-muted-foreground border-border/50",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  },
  "DEFAULT": {
    icon: Bell, // Ensure Bell is imported if used, but we'll use Clock as fallback below
    iconClass: "text-muted-foreground bg-muted",
    badgeLabel: "Notification",
    badgeClass: "bg-muted text-muted-foreground border-border/50",
    containerClass: "border-border/50 bg-card/50 hover:bg-card",
  }
};

const getRelativeTime = (dateObj) => {
  const now = new Date();
  const diffInHours = Math.floor((now - dateObj) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    if (diffInHours === 0) {
        const diffInMins = Math.floor((now - dateObj) / (1000 * 60));
        return diffInMins <= 0 ? 'Just now' : `${diffInMins}m ago`;
    }
    return `${diffInHours}h ago`;
  }
  
  const diffInDaysVal = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));
  return `${diffInDaysVal} days ago`;
};

// Native JS date helpers
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

const isThisWeek = (date) => {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  return date >= firstDayOfWeek && date <= lastDayOfWeek && !isToday(date) && !isYesterday(date);
};

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: responseData, isLoading } = useNotifications();
  const { markAllAsRead, isMarkingAllRead, markAsRead } = useNotificationMutations();

  const notifications = useMemo(() => {
    // Handle standard axios response wrappers
    const data = responseData?.data || responseData || [];
    return Array.isArray(data) ? data : [];
  }, [responseData]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (activeFilter === "Unread") filtered = filtered.filter(n => !n.isRead);
    else if (activeFilter === "Offers") filtered = filtered.filter(n => n.type === "OFFER");
    else if (activeFilter === "Applications") filtered = filtered.filter(n => ["SHORTLISTED", "INTERVIEW", "REJECTED"].includes(n.type));
    else if (activeFilter === "New drives") filtered = filtered.filter(n => n.type === "NEW_DRIVE");
    else if (activeFilter === "Deadlines") filtered = filtered.filter(n => n.type === "DEADLINE_SOON");
    else if (activeFilter === "Profile") filtered = filtered.filter(n => n.type === "PROFILE");

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups = {
      "TODAY": [],
      "YESTERDAY": [],
      "THIS WEEK": [],
      "OLDER": []
    };

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      if (isToday(date)) groups["TODAY"].push(notification);
      else if (isYesterday(date)) groups["YESTERDAY"].push(notification);
      else if (isThisWeek(date)) groups["THIS WEEK"].push(notification);
      else groups["OLDER"].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationCode || notification._id);
    }
    // Implement navigation logic here if `notification.actionUrl` exists
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {unreadCount} unread
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => markAllAsRead()}
          disabled={unreadCount === 0 || isMarkingAllRead}
          className="bg-card w-fit border-border/50 text-foreground"
        >
          {isMarkingAllRead ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Mark all as read
        </Button>
      </div>

      {/* Filters (Pills) */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
           let filterLabel = filter;
           if (filter === "All") filterLabel = `All (${notifications.length})`;
           if (filter === "Unread") filterLabel = `Unread (${unreadCount})`;

           return (
            <Button
              key={filter}
              variant={activeFilter === filter ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 text-xs h-8 border shadow-none ${
                activeFilter === filter 
                  ? "bg-secondary text-secondary-foreground border-transparent" 
                  : "bg-transparent text-muted-foreground border-border/60 hover:bg-muted/50"
              }`}
            >
              {filterLabel}
            </Button>
          )
        })}
      </div>

      {/* Timeline List */}
      <div className="space-y-8 pb-10">
        {Object.entries(groupedNotifications).map(([groupName, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={groupName} className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase pl-1">
                {groupName}
              </h3>
              
              <div className="space-y-3">
                {items.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig["DEFAULT"];
                  const Icon = config.icon;
                  const dateObj = new Date(notification.createdAt);
                  
                  // Format right-side string based on date grouping natively similar to image
                  let timeString = "";
                  if (groupName === "TODAY") {
                      timeString = getRelativeTime(dateObj);
                  } else if (groupName === "YESTERDAY") {
                      timeString = `Yesterday · ${dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                  } else if (groupName === "OLDER") {
                      timeString = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  } else {
                      timeString = getRelativeTime(dateObj);
                  }

                  return (
                    <div 
                      key={notification._id || notification.notificationCode} 
                      className={`relative flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-xl border transition-all cursor-default ${config.containerClass}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      )}

                      {/* Icon */}
                      <div className={`shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center ${config.iconClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                          <h4 className={`text-base font-semibold truncate ${notification.type === 'OFFER' ? 'text-amber-500' : 'text-foreground'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground shrink-0 sm:mt-1 font-medium">
                            {timeString}
                          </span>
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${notification.type === 'OFFER' ? 'text-amber-500/80' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${config.badgeClass}`}>
                            {config.badgeLabel}
                          </Badge>
                          
                          {/* Action Button mock based on typical notification action text */}
                          {notification.actionUrl && (
                            <Button 
                              variant={notification.type === 'OFFER' ? "link" : "outline"} 
                              size="sm" 
                              className={`h-7 px-3 text-xs ${
                                notification.type === 'OFFER' 
                                  ? 'h-auto p-0 text-amber-500 hover:text-amber-400 font-medium' 
                                  : 'bg-transparent border-border/60 hover:bg-muted'
                              }`}
                              asChild
                            >
                              <Link to={notification.actionUrl}>
                                {notification.actionText || 'View details'}
                                {notification.type === 'OFFER' ? (
                                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                ) : (
                                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                                )}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
               <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No notifications found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              You're all caught up! There are no {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
