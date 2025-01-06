"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  format,
  addDays,
  differenceInDays,
  startOfDay,
  isToday,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight,
  Timer,
  CheckCheck,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Maximize2,
  Filter,
  Search,
  Info,
} from "lucide-react";
import { Task } from "@/types";
import { getPersonalTask } from "@/actions/task";

// Constants
const CELL_WIDTH = 140;
const EXPANDED_CARD_HEIGHT = 200;
const COLLAPSED_CARD_HEIGHT = 120;
const VERTICAL_SPACING = 24;

// Types
interface Lane {
  id: string;
  icon: React.ElementType;
  color: string;
  label: string;
}

// Utility functions
const useScrollSync = (refs: React.RefObject<HTMLElement>[]) => {
  useEffect(() => {
    const handlers = new Map<HTMLElement, (e: Event) => void>();

    refs.forEach((ref) => {
      if (!ref.current) return;

      const handler = (e: Event) => {
        const target = e.target as HTMLElement;
        const scrollLeft = target.scrollLeft;

        refs.forEach((otherRef) => {
          if (otherRef.current && otherRef.current !== target) {
            otherRef.current.scrollLeft = scrollLeft;
          }
        });
      };

      handlers.set(ref.current, handler);
      ref.current.addEventListener("scroll", handler);
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current && handlers.has(ref.current)) {
          const handler = handlers.get(ref.current);
          if (handler) {
            ref.current.removeEventListener("scroll", handler);
          }
        }
      });
    };
  }, [refs]);
};

// Component for the search and filter section
const TimelineControls = ({
  onSearch,
  onFilter,
}: {
  onSearch: (term: string) => void;
  onFilter: (status: string) => void;
}) => (
  <div className="mb-6 flex items-center gap-4">
    <div className="relative max-w-md flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search tasks..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full rounded-lg border border-border/50 bg-background/50 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
    <select
      onChange={(e) => onFilter(e.target.value)}
      className="rounded-lg border border-border/50 bg-background/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">All Status</option>
      <option value="TODO">Todo</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="BACKLOG">Backlog</option>
    </select>
  </div>
);

// TaskCard component
const TaskCard = React.memo(
  ({
    task,
    lane,
    position,
    isExpanded,
    onToggleExpand,
  }: {
    task: Task;
    lane: Lane;
    position: {
      left: string;
      top: string;
      width: string;
      position: "absolute";
    };
    isExpanded: boolean;
    onToggleExpand: () => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const deadlineDate = new Date(task.deadline);
    const isPastDue = deadlineDate < new Date();

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`rounded-lg bg-gradient-to-r ${lane.color} p-6 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-white/30`}
        style={{
          ...position,
          zIndex: isHovered ? 50 : 1,
          minHeight: isExpanded ? EXPANDED_CARD_HEIGHT : COLLAPSED_CARD_HEIGHT,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Circle className={`h-5 w-5 ${isPastDue ? "text-red-300" : ""}`} />
            <h3 className="line-clamp-1 text-lg font-bold">{task.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {isPastDue && (
              <Badge variant="destructive" className="mr-2">
                Past Due
              </Badge>
            )}
            <button
              onClick={onToggleExpand}
              className="rounded-full p-2 hover:bg-white/20"
            >
              {isExpanded ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <p
          className={`mt-3 text-sm ${isExpanded ? "" : "line-clamp-2"} opacity-90`}
        >
          {task.description}
        </p>

        <motion.div layout className="mt-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className={`flex items-center gap-2 border-white/30 ${
              isPastDue ? "bg-red-500/20" : "bg-white/10"
            } px-3 py-1 text-white`}
          >
            <CheckCheck className="h-4 w-4" />
            {format(deadlineDate, "MMM d")}
          </Badge>

          {task.assignees?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered || isExpanded ? 1 : 0 }}
              className="flex -space-x-3"
            >
              {task.assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="h-8 w-8 rounded-full border-2 border-white/80 bg-primary shadow-lg"
                  title={assignee.name}
                >
                  <div className="flex h-full items-center justify-center text-xs font-bold">
                    {assignee.name.charAt(0)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 border-t border-white/20 pt-4"
          >
            <div className="flex items-center justify-between text-sm">
              <div>
                Created: {format(new Date(task.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Priority: {task.priority || "Normal"}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  },
);

TaskCard.displayName = "TaskCard";

// Main TimelineView component
const TimelineView = ({ tasks: initialTasks }: { tasks: Task[] }) => {
  const [visibleWeeks, setVisibleWeeks] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [filteredTasks, setFilteredTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between header and content
  useScrollSync([headerRef, contentRef]);

  const today = startOfDay(new Date());
  const dates = Array.from({ length: visibleWeeks * 7 }, (_, i) =>
    addDays(today, i),
  );

  const lanes: Lane[] = [
    {
      id: "TODO",
      icon: Clock,
      color: "from-amber-500/90 to-amber-600/90",
      label: "To Do",
    },
    {
      id: "IN_PROGRESS",
      icon: Timer,
      color: "from-blue-500/90 to-blue-600/90",
      label: "In Progress",
    },
    {
      id: "BACKLOG",
      icon: AlertCircle,
      color: "from-purple-500/90 to-purple-600/90",
      label: "Backlog",
    },
  ];

  // Filter and search tasks
  useEffect(() => {
    let filtered = initialTasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  }, [initialTasks, searchTerm, statusFilter]);

  const getTaskPosition = useCallback(
    (task: Task, tasks: Task[], laneId: string) => {
      const startDate = startOfDay(new Date(task.deadline));
      const daysDiff = differenceInDays(startDate, today);
      const laneTasks = tasks.filter((t) => t.status === laneId);
      const taskIndex = laneTasks.findIndex((t) => t.id === task.id);
      const rowHeight = expandedTasks.has(task.id)
        ? EXPANDED_CARD_HEIGHT
        : COLLAPSED_CARD_HEIGHT;

      const overlappingTasks = laneTasks.filter((t, index) => {
        if (index >= taskIndex) return false;
        const tDate = startOfDay(new Date(t.deadline));
        const tDiff = differenceInDays(tDate, today);
        return Math.abs(tDiff - daysDiff) < 4;
      });

      return {
        left: `${Math.max(0, daysDiff * CELL_WIDTH)}px`,
        top: `${overlappingTasks.length * (rowHeight + VERTICAL_SPACING)}px`,
        width: "360px",
        position: "absolute" as const,
      };
    },
    [expandedTasks, today],
  );

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background via-background/95 to-muted/20 p-8">
      <div className="relative">
        <Card className="sticky top-0 z-50 mb-8 bg-card/95 p-6 shadow-lg backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold">Project Timeline</h2>
              <Badge variant="secondary" className="px-3 py-1 text-lg">
                {filteredTasks.length} Tasks
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  visibleWeeks > 1 && setVisibleWeeks((prev) => prev - 1)
                }
                disabled={visibleWeeks === 1}
                className="rounded-full p-2.5 transition-colors hover:bg-muted disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Badge
                variant="outline"
                className="px-4 py-2 text-lg font-medium"
              >
                {format(today, "MMM d")} -{" "}
                {format(dates[dates.length - 1], "MMM d")}
              </Badge>
              <button
                onClick={() =>
                  !isLoading && setVisibleWeeks((prev) => prev + 1)
                }
                disabled={isLoading}
                className="rounded-full p-2.5 transition-colors hover:bg-muted disabled:opacity-50"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <TimelineControls
            onSearch={setSearchTerm}
            onFilter={setStatusFilter}
          />

          <div
            ref={headerRef}
            className="hide-scrollbar overflow-x-auto"
            style={{
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <div className="grid min-w-max auto-cols-fr grid-flow-col gap-0 border-b border-border/50">
              {dates.map((date, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`p-3 text-center min-w-[${CELL_WIDTH}px] ${
                    isToday(date) ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="text-xl font-bold text-primary">
                    {format(date, "d")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(date, "EEE")}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        <div
          ref={contentRef}
          className="relative space-y-12 overflow-x-auto p-4"
        >
          <AnimatePresence>
            {lanes.map((lane) => {
              const laneTasks = filteredTasks.filter(
                (t: Task) => t.status === lane.id,
              );
              const maxOverlap = Math.max(
                ...laneTasks.map(
                  (task) =>
                    laneTasks.filter(
                      (t) =>
                        Math.abs(
                          differenceInDays(
                            new Date(t.deadline),
                            new Date(task.deadline),
                          ),
                        ) < 4,
                    ).length,
                ),
              );

              return (
                <motion.div
                  key={lane.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <lane.icon className="mr-3 h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">{lane.label}</h3>
                      <ChevronRight className="ml-2 h-5 w-5 opacity-50" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="px-3 py-1">
                        {laneTasks.length} tasks
                      </Badge>
                      {laneTasks.length > 0 && (
                        <Badge variant="outline" className="px-3 py-1">
                          {Math.round(
                            (laneTasks.filter(
                              (t) => new Date(t.deadline) > new Date(),
                            ).length /
                              laneTasks.length) *
                              100,
                          )}
                          % Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <Card className="relative overflow-x-auto border border-border/50 bg-background/50 p-6 shadow-lg backdrop-blur-sm">
                      <div className="absolute inset-0 grid auto-cols-fr grid-flow-col divide-x divide-border/20">
                        {dates.map((date, index) => (
                          <div
                            key={index}
                            className={`min-w-[${CELL_WIDTH}px] ${
                              isToday(date) ? "bg-primary/5" : ""
                            }`}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          height: `${Math.max(1, maxOverlap) * (EXPANDED_CARD_HEIGHT + VERTICAL_SPACING)}px`,
                          minWidth: `${dates.length * CELL_WIDTH}px`,
                        }}
                        className="relative"
                      >
                        <AnimatePresence>
                          {laneTasks.map((task: Task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              lane={lane}
                              position={getTaskPosition(
                                task,
                                filteredTasks,
                                lane.id,
                              )}
                              isExpanded={expandedTasks.has(task.id)}
                              onToggleExpand={() => {
                                setExpandedTasks((prev) => {
                                  const newSet = new Set(prev);
                                  if (prev.has(task.id)) {
                                    newSet.delete(task.id);
                                  } else {
                                    newSet.add(task.id);
                                  }
                                  return newSet;
                                });
                              }}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </Card>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Page component with data fetching
const Page = () => {
  const [data, setData] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const tasks = await getPersonalTask();
        setData(tasks as Task[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-96" />
        </div>
      </div>
    );
  }

  return <TimelineView tasks={data} />;
};

export default Page;
