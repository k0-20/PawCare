import { supabase } from '@/lib/supabase';
import { type NotificationType } from '@/types';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedPetId?: string;
}

/**
 * Inserts a notification row for the given user.
 * Checks the user's in_app_notifications preference first — if disabled,
 * no notification is created. This respects the user's setting at the
 * data layer, not just in the UI.
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedPetId,
}: CreateNotificationParams): Promise<void> {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('in_app_notifications')
    .eq('user_id', userId)
    .maybeSingle();

  if (prefs && prefs.in_app_notifications === false) {
    return;
  }

  await supabase.from('in_app_notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    related_pet_id: relatedPetId ?? null,
  });
}

interface PetTaskInfo {
  petName: string;
  taskTitle: string;
  taskType: string;
  dueDate: string;
  petId: string;
  userId: string;
}

/**
 * Generates an upcoming care reminder notification for a task due within
 * the next 14 days. Does nothing if a notification with the same title
 * and related_pet_id already exists for this user in the last 7 days
 * (prevents duplicate spam).
 */
export async function generateUpcomingCareNotification(info: PetTaskInfo): Promise<void> {
  const dueDate = new Date(info.dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0 || daysUntilDue > 14) return;

  const title = `Upcoming: ${info.taskTitle} for ${info.petName}`;
  const message = `${info.petName}'s ${info.taskType.replace(/_/g, ' ')} "${info.taskTitle}" is due on ${dueDate.toLocaleDateString()}.`;

  const { data: existing } = await supabase
    .from('in_app_notifications')
    .select('id')
    .eq('user_id', info.userId)
    .eq('title', title)
    .eq('related_pet_id', info.petId)
    .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();

  if (existing) return;

  await createNotification({
    userId: info.userId,
    title,
    message,
    type: 'care_reminder',
    relatedPetId: info.petId,
  });
}

/**
 * Generates an overdue care notification for a task past its due date.
 * Only generates if no overdue notification exists for this task in the
 * last 7 days.
 */
export async function generateOverdueCareNotification(info: PetTaskInfo): Promise<void> {
  const dueDate = new Date(info.dueDate);
  const now = new Date();

  if (dueDate >= now) return;

  const title = `Overdue: ${info.taskTitle} for ${info.petName}`;
  const message = `${info.petName}'s ${info.taskType.replace(/_/g, ' ')} "${info.taskTitle}" was due on ${dueDate.toLocaleDateString()} and is now overdue. Please consult your veterinarian.`;

  const { data: existing } = await supabase
    .from('in_app_notifications')
    .select('id')
    .eq('user_id', info.userId)
    .eq('title', title)
    .eq('related_pet_id', info.petId)
    .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();

  if (existing) return;

  await createNotification({
    userId: info.userId,
    title,
    message,
    type: 'health_alert',
    relatedPetId: info.petId,
  });
}
