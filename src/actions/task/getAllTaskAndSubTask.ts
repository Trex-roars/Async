"use server";

import { db } from "@/lib/db";

// Server action to fetch tasks and subtasks by user ID
export async function getAllTaskAndSubTask(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    // Fetch tasks assigned to the user along with related data
    const userWithTasks = await db.user.findUnique({
      where: { id: userId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            priority: true, // Including priority based on schema
            assignees: {
              select: { id: true, name: true, email: true },
            },
            team: {
              select: { id: true, name: true, description: true },
            },
            comments: {
              select: {
                id: true,
                text: true,
                createdAt: true,
                updatedAt: true,
                author: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            subTasks: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                assignee: {
                  select: { id: true, name: true, email: true },
                },
                estimatedHours: true,
                actualHours: true,
                completedAt: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            relatedTasks: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
              },
            },
            attachments: {
              select: {
                id: true,
                name: true,
                url: true,
                type: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (!userWithTasks || !userWithTasks.tasks) {
      throw new Error(`User with ID ${userId} not found or has no tasks.`);
    }

    return userWithTasks.tasks;
  } catch (error) {
    console.error("Error retrieving tasks and subtasks:", error); // Log the full error
    throw new Error(
      "An error occurred while retrieving the tasks and subtasks.",
    );
  }
}
