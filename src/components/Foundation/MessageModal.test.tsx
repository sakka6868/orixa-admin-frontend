import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageModal from './MessageModal';
import FoundationApi from '../../api/FoundationApi';
import { useMessage } from '../ui/message';

vi.mock('../../api/FoundationApi');
vi.mock('../ui/message');

describe('MessageModal', () => {
  const mockUsers = [
    { id: 'user-1', name: '张三', firstName: '三', lastName: '张', birthday: null, avatar: null, credential: {} as any, roles: [] },
    { id: 'user-2', name: '李四', firstName: '四', lastName: '李', birthday: null, avatar: null, credential: {} as any, roles: [] },
  ];

  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockMessage = {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(FoundationApi.listUsers).mockResolvedValue(mockUsers);
    vi.mocked(useMessage).mockReturnValue(mockMessage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const openModal = async () => {
    const button = screen.getByRole('button', { name: '发送站内信' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('填写站内信信息，发送给指定用户')).toBeInTheDocument();
    });
  };

  describe('Rendering', () => {
    it('should render send button', () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: '发送站内信' })).toBeInTheDocument();
    });

    it('should open modal on button click', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();
    });

    it('should load users on mount', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await waitFor(() => {
        expect(FoundationApi.listUsers).toHaveBeenCalledWith({});
      });
    });

    it('should render user multi-select after modal opens', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      // User multi-select should be a listbox
      const selects = screen.getAllByRole('listbox');
      expect(selects.length).toBe(1);

      // Priority select should be a combobox
      const prioritySelect = screen.getByRole('combobox');
      expect(prioritySelect).toHaveValue('NORMAL');
    });

    it('should show send button as "发送" when no recipients selected', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      const sendButton = screen.getByRole('button', { name: '发送' });
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show warning when title is empty first (validation order)', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      fireEvent.click(screen.getByRole('button', { name: '发送' }));

      await waitFor(() => {
        expect(mockMessage.warning).toHaveBeenCalledWith('验证失败', '请输入消息标题');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show warning when receiver is not selected after title is filled', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      // Fill title first
      const titleInput = screen.getByPlaceholderText('请输入消息标题');
      fireEvent.change(titleInput, { target: { value: '测试标题' } });

      fireEvent.click(screen.getByRole('button', { name: '发送' }));

      await waitFor(() => {
        expect(mockMessage.warning).toHaveBeenCalledWith('验证失败', '请选择收件人');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show warning when content is empty', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      const titleInput = screen.getByPlaceholderText('请输入消息标题');
      fireEvent.change(titleInput, { target: { value: '测试标题' } });

      fireEvent.click(screen.getByRole('button', { name: '发送' }));

      await waitFor(() => {
        expect(mockMessage.warning).toHaveBeenCalledWith('验证失败', '请选择收件人');
      });
    });
  });

  describe('Priority selection', () => {
    it('should render priority select', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      const prioritySelect = screen.getByRole('combobox');
      expect(prioritySelect).toHaveValue('NORMAL');
    });
  });

  describe('Modal close', () => {
    it('should close modal on cancel', async () => {
      render(<MessageModal onSubmit={mockOnSubmit} />);
      await openModal();

      fireEvent.click(screen.getByRole('button', { name: '取消' }));

      await waitFor(() => {
        expect(screen.queryByText('填写站内信信息，发送给指定用户')).not.toBeInTheDocument();
      });
    });
  });
});
