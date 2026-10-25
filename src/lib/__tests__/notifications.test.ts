import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing the module under test
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockGte = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      gte: mockGte,
      maybeSingle: mockMaybeSingle,
      insert: mockInsert,
    })),
  },
}));

import {
  createNotification,
  generateUpcomingCareNotification,
  generateOverdueCareNotification,
} from '@/lib/notifications';

function resetMocks() {
  mockSelect.mockReset();
  mockEq.mockReset();
  mockMaybeSingle.mockReset();
  mockGte.mockReset();
  mockInsert.mockReset();
}

beforeEach(() => {
  resetMocks();
  // By default, chain .select().eq().maybeSingle() to return no prefs
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, gte: mockGte });
  mockGte.mockReturnValue({ maybeSingle: mockMaybeSingle });
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  mockInsert.mockResolvedValue({ data: null, error: null });
});

describe('createNotification', () => {
  it('inserts a notification when in_app_notifications preference is enabled', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { in_app_notifications: true }, error: null });

    await createNotification({
      userId: 'user-1',
      title: 'Test title',
      message: 'Test message',
      type: 'care_reminder',
      relatedPetId: 'pet-1',
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Test title',
      message: 'Test message',
      type: 'care_reminder',
      related_pet_id: 'pet-1',
    });
  });

  it('does NOT insert a notification when in_app_notifications is disabled', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { in_app_notifications: false }, error: null });

    await createNotification({
      userId: 'user-1',
      title: 'Test title',
      message: 'Test message',
      type: 'system',
    });

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('inserts a notification when no preference row exists (defaults to enabled)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await createNotification({
      userId: 'user-1',
      title: 'Fallback',
      message: 'No prefs row',
      type: 'info',
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Fallback',
      message: 'No prefs row',
      type: 'info',
      related_pet_id: null,
    });
  });

  it('sets related_pet_id to null when not provided', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { in_app_notifications: true }, error: null });

    await createNotification({
      userId: 'user-1',
      title: 'No pet',
      message: 'System message',
      type: 'system',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ related_pet_id: null }),
    );
  });
});

describe('generateUpcomingCareNotification', () => {
  function futureDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  it('creates a notification for a task due within 14 days', async () => {
    const dueDate = futureDate(7);

    // First maybeSingle: preference check (in_app enabled)
    // Second maybeSingle: existing notification dedup check (none exists)
    let callCount = 0;
    mockMaybeSingle.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: { in_app_notifications: true }, error: null });
      return Promise.resolve({ data: null, error: null });
    });

    await generateUpcomingCareNotification({
      petName: 'Rex',
      taskTitle: 'Rabies booster',
      taskType: 'vaccination',
      dueDate,
      petId: 'pet-1',
      userId: 'user-1',
    });

    expect(mockInsert).toHaveBeenCalled();
    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.type).toBe('care_reminder');
    expect(inserted.title).toContain('Rabies booster');
    expect(inserted.title).toContain('Rex');
  });

  it('does NOT create a notification for a task due more than 14 days away', async () => {
    const dueDate = futureDate(30);

    await generateUpcomingCareNotification({
      petName: 'Rex',
      taskTitle: 'Annual checkup',
      taskType: 'checkup',
      dueDate,
      petId: 'pet-1',
      userId: 'user-1',
    });

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('does NOT create a duplicate notification if one already exists', async () => {
    const dueDate = futureDate(5);

    let callCount = 0;
    mockMaybeSingle.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: { in_app_notifications: true }, error: null });
      return Promise.resolve({ data: { id: 'existing-notif' }, error: null });
    });

    await generateUpcomingCareNotification({
      petName: 'Rex',
      taskTitle: 'Deworming',
      taskType: 'deworming',
      dueDate,
      petId: 'pet-1',
      userId: 'user-1',
    });

    expect(mockInsert).not.toHaveBeenCalled();
  });
});

describe('generateOverdueCareNotification', () => {
  function pastDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  it('creates a health_alert notification for a past-due task', async () => {
    const dueDate = pastDate(3);

    let callCount = 0;
    mockMaybeSingle.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: { in_app_notifications: true }, error: null });
      return Promise.resolve({ data: null, error: null });
    });

    await generateOverdueCareNotification({
      petName: 'Luna',
      taskTitle: 'Vaccine booster',
      taskType: 'vaccination',
      dueDate,
      petId: 'pet-2',
      userId: 'user-1',
    });

    expect(mockInsert).toHaveBeenCalled();
    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.type).toBe('health_alert');
    expect(inserted.title).toContain('Overdue');
    expect(inserted.title).toContain('Luna');
  });

  it('does NOT create a notification for a task not yet overdue', async () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 5);
    const dueDate = futureDate.toISOString().split('T')[0];

    await generateOverdueCareNotification({
      petName: 'Luna',
      taskTitle: 'Vaccine booster',
      taskType: 'vaccination',
      dueDate,
      petId: 'pet-2',
      userId: 'user-1',
    });

    expect(mockInsert).not.toHaveBeenCalled();
  });
});
