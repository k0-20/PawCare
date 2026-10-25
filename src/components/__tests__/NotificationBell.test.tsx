import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

// Mock react-router Link to avoid router context
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

import { NotificationBell } from '@/components/layout/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';

const sampleNotifications = [
  {
    id: 'n1',
    user_id: 'user-1',
    title: 'Upcoming: Rabies for Rex',
    message: 'Due in 7 days',
    type: 'care_reminder' as const,
    is_read: false,
    related_pet_id: 'pet-1',
    created_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'n2',
    user_id: 'user-1',
    title: 'Overdue: Checkup for Luna',
    message: 'Was due 3 days ago',
    type: 'health_alert' as const,
    is_read: false,
    related_pet_id: 'pet-2',
    created_at: '2026-10-22T10:00:00Z',
  },
  {
    id: 'n3',
    user_id: 'user-1',
    title: 'Welcome',
    message: 'Account created',
    type: 'system' as const,
    is_read: true,
    related_pet_id: null,
    created_at: '2026-10-15T10:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockFromChain.select.mockReturnValue(mockFromChain);
  mockFromChain.eq.mockReturnValue(mockFromChain);
  mockFromChain.order.mockReturnValue(mockFromChain);
  mockFromChain.limit.mockResolvedValue({ data: sampleNotifications, error: null });
  mockFromChain.update.mockReturnValue(mockFromChain);
  mockFromChain.delete.mockReturnValue(mockFromChain);
  mockChannel.on.mockReturnThis();
  mockChannel.subscribe.mockImplementation(() => {});
});

describe('NotificationBell', () => {
  it('shows the bell icon with unread count badge', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      const bell = screen.getByLabelText('Notifications');
      expect(bell).toBeInTheDocument();
    });

    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('opens the dropdown and shows notifications when clicked', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Notifications');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Upcoming: Rabies for Rex')).toBeInTheDocument();
      expect(screen.getByText('Overdue: Checkup for Luna')).toBeInTheDocument();
    });
  });

  it('shows Mark all read button when there are unread notifications', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });
  });

  it('shows "No notifications yet" when there are zero notifications', async () => {
    mockFromChain.limit.mockResolvedValue({ data: [], error: null });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });
  });

  it('calls markAllAsRead when the Mark all read button is clicked', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    const markAllButton = screen.getByText('Mark all read').closest('button')!;
    fireEvent.click(markAllButton);

    // Verify that the update chain was called (marking notifications as read)
    expect(mockFromChain.update).toHaveBeenCalledWith({ is_read: true });
    expect(mockFromChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
