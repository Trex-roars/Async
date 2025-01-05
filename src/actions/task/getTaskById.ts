"use server";

import { db } from "@/lib/db";

// Server action to fetch task by ID
export async function getTaskById(id: string) {
  try {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Task ID is required and should be a valid string.");
    }

    // Fetch task details by ID using Prisma
    const task = await db.task.findUnique({
      where: { id },
      include: {
        assignees: {
          select: { id: true, name: true, email: true },
        },
        team: true,
        subTasks: {
          select: { id: true, title: true, status: true, assigneeId: true },
        },
        comments: {
          include: {
            author: true,
            attachments: true,
            replies: {
              include: { author: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new Error(`Task with ID ${id} not found.`);
    }

    return task;
  } catch (error: any) {
    console.error("Error retrieving task:", error.message);
    throw new Error(error.message || "An error occurred while retrieving the task.");
  }
}
