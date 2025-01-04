"use server";

import { db } from "@/lib/db";
import { TaskStatus, Priority } from "@prisma/client"; // Import the enums

interface CreateTaskInput {
  title: string;
  description?: string;
  deadline: string;
  teamId?: string;
  assigneeEmails?: string[];
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export async function createTask({
  title,
  description,
  deadline,
  teamId,
  assigneeEmails = [],
  priority = "MEDIUM",
}: CreateTaskInput) {
  try {
    // Log the input data to ensure it's being passed correctly
    console.log("createTask inputs:", {
      title,
      description,
      deadline,
      teamId,
      assigneeEmails,
      priority,
    });

    // Validate required fields
    if (!title.trim()) {
      throw new Error("The title is required and cannot be empty.");
    }
    if (!deadline) {
      throw new Error("The deadline is required.");
    }

    // Parse and validate the deadline
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      throw new Error("Invalid deadline format. Please provide a valid date string.");
    }

    // Validate emails if provided
    const invalidEmails = assigneeEmails.filter((email) => !validateEmail(email));
    if (invalidEmails.length > 0) {
      throw new Error(`The following emails are invalid: ${invalidEmails.join(", ")}`);
    }

    // Fetch users by their emails
    const users = assigneeEmails.length
      ? await db.user.findMany({
        where: {
          email: { in: assigneeEmails },
        },
        select: { id: true },
      })
      : [];

    // Log the fetched users
    console.log("Fetched users:", users);

    // Handle case where no users were found
    if (assigneeEmails.length && users.length === 0) {
      throw new Error("No users found for the provided email addresses.");
    }

    // Prepare task data
    const taskData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      deadline: parsedDeadline,
      priority: priority as Priority, // Use Prisma's Priority enum
      status: TaskStatus.TODO, // Default status is TODO
      assignees: {
        connect: users.map((user) => ({ id: user.id })),
      },
      startDate: new Date(), // Set start date to current time
    };

    // Optionally include teamId if provided
    if (teamId) {
      taskData.team = { connect: { id: teamId } };
    }

    // Log the task data before creation to make sure it's structured correctly
    console.log("Task Data to be created:", taskData);

    // Ensure the payload is an object before attempting creation
    if (taskData === null || typeof taskData !== "object") {
      throw new Error("Task data is not valid.");
    }

    // Create the new task in the database
    const newTask = await db.task.create({ data: taskData });

    // Log the created task data
    console.log("Created Task:", newTask);

    return newTask;
  } catch (error: any) {
    console.error("Error creating task:", error); // Log the full error
    throw new Error(error.message || "An error occurred while creating the task.");
  }
}

// Helper function for email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
