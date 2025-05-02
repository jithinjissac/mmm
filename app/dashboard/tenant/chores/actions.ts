"use server"

import type { ChoreFormData, ChoreStatus } from "@/types/chores"
import {
  getChores,
  getChoreById,
  createChore,
  updateChore,
  updateChoreStatus,
  deleteChore,
  addChoreComment,
  getChoreComments,
} from "@/lib/mock-chore-service"
import { revalidatePath } from "next/cache"

export async function fetchChores(filters?: any) {
  try {
    return await getChores(filters)
  } catch (error) {
    console.error("Error fetching chores:", error)
    throw new Error("Failed to fetch chores")
  }
}

export async function fetchChoreById(id: string) {
  try {
    return await getChoreById(id)
  } catch (error) {
    console.error(`Error fetching chore ${id}:`, error)
    throw new Error("Failed to fetch chore")
  }
}

export async function fetchChoreComments(choreId: string) {
  try {
    return await getChoreComments(choreId)
  } catch (error) {
    console.error(`Error fetching comments for chore ${choreId}:`, error)
    throw new Error("Failed to fetch chore comments")
  }
}

export async function createNewChore(choreData: ChoreFormData, userId: string, userName: string, propertyId: string) {
  try {
    const newChore = await createChore(choreData, userId, userName, propertyId)
    revalidatePath("/dashboard/tenant/chores")
    return { success: true, data: newChore }
  } catch (error) {
    console.error("Error creating chore:", error)
    return { success: false, error: "Failed to create chore" }
  }
}

export async function updateExistingChore(id: string, choreData: Partial<ChoreFormData>) {
  try {
    const updatedChore = await updateChore(id, choreData)
    revalidatePath(`/dashboard/tenant/chores/${id}`)
    return { success: true, data: updatedChore }
  } catch (error) {
    console.error(`Error updating chore ${id}:`, error)
    return { success: false, error: "Failed to update chore" }
  }
}

export async function updateChoreStatusAction(id: string, status: ChoreStatus) {
  try {
    const updatedChore = await updateChoreStatus(id, status)
    revalidatePath(`/dashboard/tenant/chores/${id}`)
    revalidatePath("/dashboard/tenant/chores")
    return { success: true, data: updatedChore }
  } catch (error) {
    console.error(`Error updating status for chore ${id}:`, error)
    return { success: false, error: "Failed to update chore status" }
  }
}

export async function deleteChoreAction(id: string) {
  try {
    await deleteChore(id)
    revalidatePath("/dashboard/tenant/chores")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting chore ${id}:`, error)
    return { success: false, error: "Failed to delete chore" }
  }
}

export async function addChoreCommentAction(choreId: string, userId: string, userName: string, content: string) {
  try {
    const newComment = await addChoreComment(choreId, userId, userName, content)
    revalidatePath(`/dashboard/tenant/chores/${choreId}`)
    return { success: true, data: newComment }
  } catch (error) {
    console.error(`Error adding comment to chore ${choreId}:`, error)
    return { success: false, error: "Failed to add comment" }
  }
}
