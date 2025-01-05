"use client";

import { getAllTaskAndSubTask, updateStatusofTask } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/nextjs";
import { Task } from "@prisma/client";
import {
  AlertCircle,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskColumn } from "./_components/TaskColumn";

const DashboardContent = () => {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]); // Initialize with empty array
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) {
        setError("User ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const data = await getAllTaskAndSubTask(userId);
        console.log(data);
        // Ensure data.tasks exists before setting state
        if (data) {
          setTasks(data as Task[]);
        } else {
          setTasks([]);
          // setError("No tasks found.");
        }
      } catch {
        setError("An error occurred while fetching tasks and subtasks.");
        setTasks([]); // Ensure tasks is always an array
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && userId) {
      fetchTasks();
    }
  }, [isLoaded, userId]);

  const tasksByStatus = useMemo(
    () => ({
      todo: tasks?.filter((task) => task.status === "TODO") ?? [],
      inProgress: tasks?.filter((task) => task.status === "IN_PROGRESS") ?? [],
      completed: tasks?.filter((task) => task.status === "COMPLETED") ?? [],
      backlog: tasks?.filter((task) => task.status === "BACKLOG") ?? [],
    }),
    [tasks],
  );

  const stats = useMemo(() => {
    const totalTasks = tasks?.length ?? 0;
    const completedTasks = tasksByStatus.completed.length;
    const progressPercentage = totalTasks
      ? (completedTasks / totalTasks) * 100
      : 0;
    const upcomingDeadlines =
      tasks?.filter(
        (task) =>
          new Date(task.deadline) > new Date() && task.status !== "COMPLETED",
      ).length ?? 0;

    return {
      total: totalTasks,
      completed: completedTasks,
      progress: progressPercentage,
      upcoming: upcomingDeadlines,
    };
  }, [tasks, tasksByStatus]);

  const moveTask = (task: Task, newStatus: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t,
      ),
    );
    updateStatusofTask(task.id, newStatus as TaskStatus);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-red-500">
          <AlertCircle className="h-16 w-16" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/80">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
        {/* Dashboard Header Section */}
        <div className="relative rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Team Task Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Manage and track your tasks efficiently. Drag and drop tasks
                  between columns to update their status.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/dashboard/task/create-task")}
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="font-medium">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{stats.completed}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Upcoming Deadlines
                    </p>
                    <p className="font-medium">{stats.upcoming}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <BarChart2 className="h-5 w-5 text-muted-foreground" />
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground">
                      Overall Progress
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={stats.progress} className="flex-1" />
                      <span className="text-sm font-medium">
                        {Math.round(stats.progress)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Task Columns */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TaskColumn
            title="To Do"
            tasks={tasksByStatus.todo}
            status="TODO"
            onMoveTask={moveTask}
          />
          <TaskColumn
            title="In Progress"
            tasks={tasksByStatus.inProgress}
            status="IN_PROGRESS"
            onMoveTask={moveTask}
          />
          <TaskColumn
            title="Completed"
            tasks={tasksByStatus.completed || []}
            status="COMPLETED"
            onMoveTask={moveTask}
          />
        </div>

        <div className="mt-6">
          <TaskColumn
            title="Backlog"
            tasks={tasksByStatus.backlog}
            status="BACKLOG"
            onMoveTask={moveTask}
          />
        </div>
      </div>
    </div>
  );
};

const Page = () => (
  <DndProvider backend={HTML5Backend}>
    <DashboardContent />
  </DndProvider>
);

export default Page;
