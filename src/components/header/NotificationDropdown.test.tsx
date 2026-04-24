import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import '@testing-library/jest-dom';
import NotificationDropdown from './NotificationDropdown';
import AnnouncementApi from '../../api/AnnouncementApi';
import { useCurrentStaff } from '../../hooks/useCurrentStaff';
import type { Announcement } from '../../types/announcement';

// Mock the modules
vi.mock('../../api/AnnouncementApi');
vi.mock('../../hooks/useCurrentStaff');

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('NotificationDropdown', () => {
  const mockStaff = { userId: 'test-user-123', id: 'staff-1', menus: [] };

  const mockAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: '系统升级通知',
      content: '系统将于今晚10点进行升级维护',
      priority: 'HIGH',
      status: 'PUBLISHED',
      publishedAt: '2026-04-24T10:00:00Z',
      createdBy: 'admin',
      createdAt: '2026-04-24T09:00:00Z',
      updatedAt: '2026-04-24T09:00:00Z',
    },
    {
      id: 'ann-2',
      title: '新功能上线',
      content: '新版本已上线，欢迎体验',
      priority: 'NORMAL',
      status: 'PUBLISHED',
      publishedAt: '2026-04-23T15:00:00Z',
      createdBy: 'admin',
      createdAt: '2026-04-23T14:00:00Z',
      updatedAt: '2026-04-23T14:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    vi.mocked(useCurrentStaff).mockReturnValue({
      staff: mockStaff,
      loading: false,
      error: null,
      refetch: vi.fn(),
      clearCache: vi.fn(),
    });
    vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue([]);
    vi.mocked(AnnouncementApi.markAsRead).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render notification bell button', () => {
      renderWithRouter(<NotificationDropdown />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show red dot when there are unread announcements', async () => {
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue(mockAnnouncements);
      renderWithRouter(<NotificationDropdown />);

      await waitFor(() => {
        const redDot = document.querySelector('.animate-ping');
        expect(redDot).toBeInTheDocument();
      });
    });

    it('should not show red dot when there are no unread announcements', async () => {
      renderWithRouter(<NotificationDropdown />);

      await waitFor(() => {
        const redDot = document.querySelector('.animate-ping');
        expect(redDot).not.toBeInTheDocument();
      });
    });
  });

  describe('Dropdown behavior', () => {
    it('should open dropdown on click', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('系统公告')).toBeInTheDocument();
      });
    });

    it('should show empty state when no announcements', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('暂无未读公告')).toBeInTheDocument();
      });
    });

    it('should display announcements when available', async () => {
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue(mockAnnouncements);
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('系统升级通知')).toBeInTheDocument();
        expect(screen.getByText('新功能上线')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      let resolvePromise: (value: Announcement[]) => void;
      const promise = new Promise<Announcement[]>(resolve => { resolvePromise = resolve; });
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockReturnValue(promise);

      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('加载中...')).toBeInTheDocument();

      resolvePromise!([]);
    });
  });

  describe('Announcement display', () => {
    it('should show priority badge for HIGH priority', async () => {
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue([mockAnnouncements[0]]);
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('高')).toBeInTheDocument();
      });
    });

    it('should show priority badge for NORMAL priority', async () => {
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue([mockAnnouncements[1]]);
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('普通')).toBeInTheDocument();
      });
    });

    it('should display announcement content', async () => {
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue([mockAnnouncements[0]]);
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('系统将于今晚10点进行升级维护')).toBeInTheDocument();
      });
    });
  });

  describe('Mark as read', () => {
    it('should call markAsRead when announcement is clicked', async () => {
      vi.mocked(AnnouncementApi.getUnreadAnnouncements).mockResolvedValue([mockAnnouncements[0]]);
      renderWithRouter(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('系统升级通知')).toBeInTheDocument();
      });

      // Click on the announcement title text to trigger the onItemClick
      const titleElement = screen.getByText('系统升级通知');
      fireEvent.click(titleElement);

      await waitFor(() => {
        expect(AnnouncementApi.markAsRead).toHaveBeenCalledWith('ann-1');
      });
    });
  });

  describe('View all link', () => {
    it('should have link to announcements page', async () => {
      renderWithRouter(<NotificationDropdown />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const link = screen.getByText('查看全部公告');
        expect(link).toHaveAttribute('href', '/foundation/announcements');
      });
    });
  });

  describe('Authentication', () => {
    it('should not fetch announcements when user is not logged in', async () => {
      vi.mocked(useCurrentStaff).mockReturnValue({
        staff: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      });

      renderWithRouter(<NotificationDropdown />);

      await waitFor(() => {
        expect(AnnouncementApi.getUnreadAnnouncements).not.toHaveBeenCalled();
      });
    });
  });
});
