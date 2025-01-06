"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, differenceInDays, startOfDay } from "date-fns";
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
} from "lucide-react";
import { Task } from "@/types";
import { getPersonalTask } from "@/actions/task";

const TimelineView = ({ tasks }: { tasks: Task[] }) => {
  const [visibleWeeks, setVisibleWeeks] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(
    new Set(),
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);

  const today = startOfDay(new Date());
  const dates = Array.from({ length: visibleWeeks * 7 }, (_, i) =>
    addDays(today, i),
  );

  const lanes = [
    { id: "TODO", icon: Clock, color: "from-amber-500/90 to-amber-600/90" },
    {
      id: "IN_PROGRESS",
      icon: Timer,
      color: "from-blue-500/90 to-blue-600/90",
    },
    {
      id: "BACKLOG",
      icon: AlertCircle,
      color: "from-purple-500/90 to-purple-600/90",
    },
  ];

  const getTaskPosition = (task: Task, tasks: Task[], laneId: string) => {
    const startDate = startOfDay(new Date(task.deadline));
    const daysDiff = differenceInDays(startDate, today);
    const laneTasks = tasks.filter((t) => t.status === laneId);
    const taskIndex = laneTasks.findIndex((t) => t.id === task.id);
    const rowHeight = expandedTasks.has(task.id) ? 160 : 100;
    const verticalSpacing = 20;

    const overlappingTasks = laneTasks.filter((t, index) => {
      if (index >= taskIndex) return false;
      const tDate = startOfDay(new Date(t.deadline));
      const tDiff = differenceInDays(tDate, today);
      return Math.abs(tDiff - daysDiff) < 4;
    });

    return {
      left: `${Math.max(0, daysDiff * 120)}px`,
      top: `${overlappingTasks.length * (rowHeight + verticalSpacing)}px`,
      width: "320px",
      position: "absolute" as const,
    };
  };

  const TaskCard = ({
    task,
    lane,
    tasks,
  }: {
    task: Task;
    lane: (typeof lanes)[0];
    tasks: Task[];
  }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isExpanded = expandedTasks.has(task.id);
    const style = getTaskPosition(task, tasks, lane.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`rounded-lg bg-gradient-to-r ${lane.color} p-4 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-white/30`}
        style={{
          ...style,
          zIndex: isHovered ? 50 : 1,
          minHeight: isExpanded ? "160px" : "auto",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4" />
            <h3 className="line-clamp-1 font-bold">{task.title}</h3>
          </div>
          <button
            onClick={() =>
              setExpandedTasks((prev) => {
                const newSet = new Set(prev);
                if (prev.has(task.id)) newSet.delete(task.id);
                else newSet.add(task.id);
                return newSet;
              })
            }
            className="rounded-full p-1 hover:bg-white/20"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <p
          className={`mt-2 text-sm ${isExpanded ? "" : "line-clamp-2"} opacity-90`}
        >
          {task.description}
        </p>
        <motion.div layout className="mt-3 flex items-center justify-between">
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-white/30 bg-white/10 text-white"
          >
            <CheckCheck className="h-3 w-3" />
            {format(new Date(task.deadline), "MMM d")}
          </Badge>
          {task.assignees?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered || isExpanded ? 1 : 0 }}
              className="flex -space-x-2"
            >
              {task.assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="h-6 w-6 rounded-full border-2 border-white/80 bg-primary shadow-lg"
                  title={assignee.name}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  const DateHeader = React.memo(() => (
    <div className="sticky top-0 z-50 mb-8 min-w-[1200px]">
      <Card className="bg-card/95 p-6 shadow-lg backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Project Timeline</h2>
            <Badge variant="secondary">{tasks.length} Tasks</Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                visibleWeeks > 1 && setVisibleWeeks((prev) => prev - 1)
              }
              disabled={visibleWeeks === 1}
              className="rounded-full p-2 transition-colors hover:bg-muted disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Badge variant="outline" className="font-medium">
              {format(today, "MMM d")} -{" "}
              {format(dates[dates.length - 1], "MMM d")}
            </Badge>
            <button
              onClick={() => !isLoading && setVisibleWeeks((prev) => prev + 1)}
              disabled={isLoading}
              className="rounded-full p-2 transition-colors hover:bg-muted disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid auto-cols-fr grid-flow-col gap-0 overflow-hidden border-b border-border/50">
          {dates.map((date, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="p-2 text-center"
            >
              <div className="text-lg font-bold text-primary">
                {format(date, "d")}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(date, "EEE")}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  ));

  DateHeader.displayName = "DateHeader";

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-2rem)] overflow-y-auto bg-gradient-to-br from-background via-background/95 to-muted/20 p-6"
    >
      <div ref={timelineRef} className="relative min-w-[1200px]">
        <DateHeader />

        <div className="relative space-y-8 p-2">
          <AnimatePresence>
            {lanes.map((lane) => {
              const laneTasks = tasks.filter((t: Task) => t.status === lane.id);
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
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <lane.icon className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold">
                        {lane.id.replace("_", " ")}
                      </h3>
                      <ChevronRight className="ml-2 h-4 w-4 opacity-50" />
                    </div>
                    <Badge variant="secondary">{laneTasks.length} tasks</Badge>
                  </div>

                  {isLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <Card className="relative border border-border/50 bg-background/50 p-4 shadow-lg backdrop-blur-sm">
                      <div className="absolute inset-0 grid auto-cols-fr grid-flow-col divide-x divide-border/20" />
                      <div
                        style={{ height: `${Math.max(1, maxOverlap) * 140}px` }}
                        className="relative"
                      >
                        <AnimatePresence>
                          {laneTasks.map((task: Task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              lane={lane}
                              tasks={tasks}
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

const Page = () => {
  const [data, setData] = useState<Task[]>([]);

  const reso = async () => {
    const tasks = await getPersonalTask();
    setData(tasks as Task[]);
  };

  useEffect(() => {
    reso();
  }, []);

  return <TimelineView tasks={data} />;
};

export default Page;
