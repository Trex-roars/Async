import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

import {
  format,
  addDays,
  differenceInDays,
  startOfDay,
  isToday,
  isPast,
} from "date-fns";
import {
  Calendar,
  Clock,
  ChevronDown,
  Info,
  Maximize2,
  Filter,
  AlertCircle,
  ChevronUp,
} from "lucide-react";

interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  createdAt: string;
  assignees?: Assignee[];
}

interface TimelineProps {
  tasks: Task[];
}

const CELL_WIDTH = 160;
const COMPACT_HEIGHT = 84;
const EXPANDED_HEIGHT = 180;
const VERTICAL_GAP = 12;
const DAYS_TO_SHOW = 30;
const HEADER_HEIGHT = 140;
const BACKLOG_HEIGHT = 320;

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "BACKLOG":
      return "from-purple-500/90 to-purple-600/90";
    case "TODO":
      return "from-amber-500/90 to-amber-600/90";
    case "IN_PROGRESS":
      return "from-blue-500/90 to-blue-600/90";
    case "COMPLETED":
      return "from-green-500/90 to-green-600/90";
    default:
      return "from-gray-500/90 to-gray-600/90";
  }
};

const BacklogCard = ({ task }: { task: Task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPastDue = new Date(task.deadline) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group relative mb-2"
    >
      <motion.div
        className={`rounded-lg bg-gradient-to-r ${getStatusColor(
          task.status,
        )} p-3 text-white shadow-lg transition-all duration-200 ease-in-out group-hover:scale-[1.02] group-hover:shadow-xl group-hover:ring-2 group-hover:ring-white/30`}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-medium group-hover:text-white/90">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                isPastDue ? "bg-red-500/20" : "bg-white/10"
              } text-xs text-white transition-colors group-hover:bg-white/20`}
            >
              {format(new Date(task.deadline), "MMM d")}
            </Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              <p className="text-sm opacity-90 group-hover:opacity-100">
                {task.description}
              </p>
              {task.assignees && (
                <div className="flex -space-x-2">
                  {task.assignees.map((assignee) => (
                    <motion.div
                      key={assignee.id}
                      className="h-6 w-6 rounded-full border-2 border-white/50 bg-white/20 transition-transform hover:z-10 hover:scale-110"
                      whileHover={{ y: -2 }}
                      title={assignee.name}
                    >
                      <div className="flex h-full items-center justify-center text-xs font-bold">
                        {assignee.name.charAt(0)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const TaskCard = ({
  task,
  left,
  width,
  top,
}: {
  task: Task;
  left: number;
  width: number;
  top: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPastDue = new Date(task.deadline) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group absolute"
      style={{
        left: `${left * CELL_WIDTH}px`,
        width: `${Math.max(2, width) * CELL_WIDTH - 8}px`,
        top: `${top * (COMPACT_HEIGHT + VERTICAL_GAP)}px`,
        height: isExpanded ? EXPANDED_HEIGHT : COMPACT_HEIGHT,
        transition: "height 0.2s ease-in-out",
      }}
    >
      <motion.div
        className={`h-full rounded-lg bg-gradient-to-r ${getStatusColor(
          task.status,
        )} p-3 text-white shadow-lg transition-all duration-200 ease-in-out group-hover:scale-[1.02] group-hover:shadow-xl group-hover:ring-2 group-hover:ring-white/30 ${isExpanded ? "z-50" : "z-10"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-medium group-hover:text-white/90">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                isPastDue ? "bg-red-500/20" : "bg-white/10"
              } text-xs text-white transition-colors group-hover:bg-white/20`}
            >
              {format(new Date(task.deadline), "MMM d")}
            </Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              <p className="text-sm opacity-90 group-hover:opacity-100">
                {task.description}
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className="opacity-75 group-hover:opacity-90">
                  Created: {format(new Date(task.createdAt), "MMM d")}
                </span>
                <Badge
                  variant="outline"
                  className="bg-white/10 text-xs transition-colors group-hover:bg-white/20"
                >
                  {task.priority}
                </Badge>
              </div>

              {task.assignees && (
                <div className="flex -space-x-2">
                  {task.assignees.map((assignee) => (
                    <motion.div
                      key={assignee.id}
                      className="h-6 w-6 rounded-full border-2 border-white/50 bg-white/20 transition-transform hover:z-10 hover:scale-110"
                      whileHover={{ y: -2 }}
                      title={assignee.name}
                    >
                      <div className="flex h-full items-center justify-center text-xs font-bold">
                        {assignee.name.charAt(0)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const TimelineView: React.FC<TimelineProps> = ({ tasks }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const today = startOfDay(new Date());
  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
    addDays(today, i),
  );

  const backlogTasks = tasks.filter(
    (task) => task.status.toUpperCase() === "BACKLOG",
  );
  const activeTasks = tasks.filter(
    (task) => task.status.toUpperCase() !== "BACKLOG",
  );

  // Handle scroll sync
  const handleScroll = useCallback(() => {
    if (containerRef.current && headerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      headerRef.current.scrollLeft = scrollLeft;
      setScrollPosition(scrollLeft);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Calculate task positions
  const getTaskPositions = (tasks: Task[]) => {
    const taskPositions = new Map<
      string,
      { left: number; width: number; top: number }
    >();
    const rows: { start: number; end: number }[][] = [[]];

    const sortedTasks = [...tasks].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    sortedTasks.forEach((task) => {
      const startDate = startOfDay(new Date(task.createdAt));
      const endDate = startOfDay(new Date(task.deadline));
      const left = Math.max(0, differenceInDays(startDate, today));
      const width = Math.max(1, differenceInDays(endDate, startDate));

      let rowIndex = 0;
      let fits = false;

      while (!fits) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }

        fits = !rows[rowIndex].some(
          (existing) =>
            (left < existing.end && left + width > existing.start) ||
            (existing.start < left + width && existing.end > left),
        );

        if (fits) {
          rows[rowIndex].push({ start: left, end: left + width });
        } else {
          rowIndex++;
        }
      }

      taskPositions.set(task.id, { left, width, top: rowIndex });
    });

    return { taskPositions, rowCount: rows.length };
  };

  const { taskPositions, rowCount } = getTaskPositions(activeTasks);

  const filteredTasks =
    selectedTab === "all"
      ? activeTasks
      : activeTasks.filter(
          (task) => task.status.toUpperCase() === selectedTab.toUpperCase(),
        );

  return (
    <Card className="mr-20 flex h-screen items-center justify-center p-10">
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="sticky top-0 z-50 space-y-4 bg-background/80 p-4 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Timeline</h2>
              <Badge variant="secondary">{tasks.length} Tasks</Badge>
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="todo">Todo</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {backlogTasks.length > 0 && (
            <Card className="bg-muted/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-500" />
                  <h3 className="font-semibold">Backlog</h3>
                  <Badge variant="secondary">{backlogTasks.length}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {backlogTasks.map((task) => (
                  <BacklogCard key={task.id} task={task} />
                ))}
              </div>
            </Card>
          )}

          <div
            ref={headerRef}
            className="overflow-x-hidden"
            style={{ scrollBehavior: "smooth" }}
          >
            <div
              className="grid auto-cols-fr grid-flow-col gap-0 border-b border-border/50"
              style={{ width: `${DAYS_TO_SHOW * CELL_WIDTH}px` }}
            >
              {dates.map((date, i) => (
                <div
                  key={i}
                  className={`w-[${CELL_WIDTH}px] p-3 text-center ${
                    isToday(date) ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="text-lg font-bold text-primary">
                    {format(date, "d")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, "EEE")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-auto p-4"
          style={{ scrollBehavior: "smooth" }}
        >
          <div
            ref={contentRef}
            className="relative"
            style={{
              width: `${DAYS_TO_SHOW * CELL_WIDTH}px`,
              height: `${rowCount * (COMPACT_HEIGHT + VERTICAL_GAP)}px`,
              minHeight: "100%",
            }}
          >
            <div className="absolute inset-0 grid auto-cols-fr grid-flow-col divide-x divide-border/20">
              {dates.map((date, i) => (
                <div
                  key={i}
                  className={`w-[${CELL_WIDTH}px] ${
                    isToday(date) ? "bg-primary/5" : ""
                  }`}
                />
              ))}
            </div>

            {filteredTasks.map((task) => {
              const position = taskPositions.get(task.id);
              if (!position) return null;

              return <TaskCard key={task.id} task={task} {...position} />;
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TimelineView;
