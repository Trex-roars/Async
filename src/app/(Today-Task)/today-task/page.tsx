"use client";

import { Badge } from "@/components/ui/badge";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays, format, addDays } from "date-fns";
import { getAllTaskAndSubTask } from "@/actions/task";
import { Circle } from "lucide-react";
import { Task } from "@/types";

const Page = () => {
  const [tasks, setTasks] = React.useState([]);
  const fn = async () => {
    const response = await getAllTaskAndSubTask();
    setTasks(response);
  };
  React.useEffect(() => {
    fn();
  }, []);

  return <TaskTimeline tasks={tasks} />;
};
export default Page;

const TaskTimeline = ({ tasks }: { tasks: Task[] }) => {
  // Get date range for the timeline
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  // Group tasks by status
  const statusGroups = {
    TODO: tasks.filter((t: Task) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t: Task) => t.status === "IN_PROGRESS"),
    COMPLETED: tasks.filter((t: Task) => t.status === "COMPLETED"),
  };

  // Calculate task position and width
  const getTaskStyle = (task: Task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.deadline);
    const daysFromStart = differenceInDays(start, today);
    const duration = differenceInDays(end, start);

    return {
      left: `${Math.max(0, daysFromStart * 7.14)}%`,
      width: `${Math.min(100, duration * 7.14)}%`,
      backgroundColor:
        task.status === "COMPLETED"
          ? "bg-green-600"
          : task.status === "IN_PROGRESS"
            ? "bg-blue-600"
            : "bg-gray-600",
    };
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      {/* Timeline header */}
      <div className="grid-cols-14 grid gap-1">
        {dates.map((date, i) => (
          <div key={i} className="text-center text-xs font-medium">
            {format(date, "MMM d")}
          </div>
        ))}
      </div>

      {/* Status lanes */}
      {Object.entries(statusGroups).map(([status, tasks]) => (
        <Card key={status} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="mb-4 font-semibold">{status.replace("_", " ")}</div>
            <div className="relative min-h-[100px] border-l border-r">
              {/* Grid lines */}
              <div className="grid-cols-14 absolute inset-0 grid gap-1">
                {dates.map((_, i) => (
                  <div key={i} className="border-l border-gray-200" />
                ))}
              </div>

              {/* Tasks */}
              {tasks.map((task: Task) => {
                const style = getTaskStyle(task);
                return (
                  <div
                    key={task.id}
                    className={`absolute my-1 h-12 rounded-md p-2 text-sm text-white ${style.backgroundColor} transition-all`}
                    style={{ left: style.left, width: style.width }}
                  >
                    <div className="truncate">{task.title}</div>
                    <div className="text-xs opacity-80">{task.description}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
