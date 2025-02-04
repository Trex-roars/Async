"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getTodayTask() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be logged in to create tasks");
  }
  try {
    const tasks = await db.task.findMany({
      where: {
        creatorId: userId,
        deadline: {
          gte: new Date(),
        },
      },
    });
    return tasks;
  } catch (err) {
    console.log("Can't get the assigned tasks of the user", err);
  }
}
