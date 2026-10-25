import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock Supabase ──────────────────────────────────────────────────────────

const mockFromChain = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
};

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockFromChain),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

// ── Mock auth ──────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

import { useNotifications } from '@/hooks/useNotifications';

const sampleNotifications = [
  {
    id: 'n1',
    user_id: 'user-1',
    title: 'Upcoming: Rabies for Rex',
    message: 'Rex vaccination due soon',
    type: 'care_reminder',
    is_read: false,
    related_pet_id: 'pet-1',
    created_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'n2',
    user_id: 'user-1',
    title: 'Overdue: Checkup for Luna',
    message: 'Luna checkup is overdue',
    type: 'health_alert',
    is_read: false,
    related_pet_id: 'pet-2',
    created_at: '2026-10-22T10:00:00Z',
  },
  {
    id: 'n3',
    user_id: 'user-1',
    title: 'Welcome',
    message: 'Account created',
    type: 'system',
    is_read: true,
    related_pet_id: null,
    created_at: '2026-10-15T10:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  // SELECT chain
  mockFromChain.select.mockReturnValue(mockFromChain);
  mockFromChain.eq.mockReturnValue(mockFromChain);
  mockFromChain.order.mockReturnValue(mockFromChain);
  mockFromChain.limit.mockResolvedValue({ data: sampleNotifications, error: null });
  // UPDATE chain
  mockFromChain.update.mockReturnValue(mockFromChain);
  // DELETE chain
  mockFromChain.delete.mockReturnValue(mockFromChain);
  mockChannel.on.mockReturnThis();
  mockChannel.subscribe.mockImplementation(() => {});
});

describe('useNotifications', () => {
  it('loads notifications for the current user', async () => {
    const { result } = renderHook(() => useNotifications());

    // Wait for the async fetch to complete
    await act(async () => {
      await vi.waitFor(() => expect(result.current.loading).toBe(false));
    });

    expect(result.current.notifications).toHaveLength(3);
    expect(result.current.unreadCount).toBe(2);
  });

  it('markAsRead updates the notification in state', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await vi.waitFor(() => expect(result.current.loading).toBe(false));
    });

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    const n1 = result.current.notifications.find((n) => n.id === 'n1');
    expect(n1?.is_read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it('markAllAsRead marks all unread notifications as read', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await vi.waitFor(() => expect(result.current.loading).toBe(false));
    });

    expect(result.current.unreadCount).toBe(2);

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.notifications.every((n) => n.is_read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('deleteNotification removes the notification from state', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await vi.waitFor(() => expect(result.current.loading).toBe(false));
    });

    expect(result.current.notifications).toHaveLength(3);

    await act(async () => {
      await result.current.deleteNotification('n2');
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications.find((n) => n.id === 'n2')).toBeUndefined();
  });

  it('queries are scoped to the current user via user_id filter', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await vi.waitFor(() => expect(result.current.loading).toBe(false));
    });

    // Verify that the select chain was called with eq('user_id', 'user-1')
    expect(mockFromChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
