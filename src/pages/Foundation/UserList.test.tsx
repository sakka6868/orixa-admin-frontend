import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all dependencies before importing the component
vi.mock('../../api/FoundationApi');
vi.mock('../../hooks/useMountEffect');
vi.mock('../../components/ui/message');
vi.mock('../../components/ui/modal');
vi.mock('../../utils/export');
vi.mock('react-helmet-async', () => ({
    Helmet: ({ children }: { children: React.ReactNode }) => children,
    Meta: () => null,
    Link: () => null,
    Style: () => null,
    Title: () => null,
}));

import UserList from './UserList';
import FoundationApi from '../../api/FoundationApi';
import { User, Role } from '../../types/user';
import { useMessage } from '../../components/ui/message';
import { useModal } from '../../components/ui/modal';

describe('UserList Search', () => {
    const mockRoles: Role[] = [
        { id: 'role-1', name: '管理员', code: 'ADMIN', description: '管理员角色' },
        { id: 'role-2', name: '用户', code: 'USER', description: '普通用户' },
    ];

    const mockUsers: User[] = [
        {
            id: 'user-1',
            name: '张三',
            firstName: '三',
            lastName: '张',
            birthday: '1990-01-01',
            avatar: null,
            credential: { credentialKey: 'zhangsan' },
            roles: [mockRoles[0]],
        },
        {
            id: 'user-2',
            name: '李四',
            firstName: '四',
            lastName: '李',
            birthday: '1991-02-02',
            avatar: null,
            credential: { credentialKey: 'lisi' },
            roles: [mockRoles[1]],
        },
    ];

    beforeEach(async () => {
        vi.clearAllMocks();

        // Setup mocks
        vi.mocked(FoundationApi.listUsers).mockResolvedValue(mockUsers);
        vi.mocked(FoundationApi.listRoles).mockResolvedValue(mockRoles);
        vi.mocked(useMessage).mockReturnValue({
            warning: vi.fn(),
            error: vi.fn(),
            success: vi.fn(),
        } as never);
        vi.mocked(useModal).mockReturnValue({
            confirm: vi.fn().mockResolvedValue(true),
        } as never);
    });

    describe('Search UI Rendering', () => {
        it('should render search input field', async () => {
            await act(async () => {
                render(<UserList />);
            });
            expect(screen.getByPlaceholderText('请输入用户名或姓名')).toBeInTheDocument();
        });

        it('should render role filter dropdown', async () => {
            await act(async () => {
                render(<UserList />);
            });
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should render search and reset buttons', async () => {
            await act(async () => {
                render(<UserList />);
            });
            expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
        it('should update search input when typing', async () => {
            await act(async () => {
                render(<UserList />);
            });
            const input = screen.getByPlaceholderText('请输入用户名或姓名');
            fireEvent.change(input, { target: { value: '张三' } });
            expect(input).toHaveValue('张三');
        });

        it('should call listUsers with name parameter when search is clicked', async () => {
            await act(async () => {
                render(<UserList />);
            });
            const input = screen.getByPlaceholderText('请输入用户名或姓名');
            fireEvent.change(input, { target: { value: '张三' } });
            fireEvent.click(screen.getByRole('button', { name: '搜索' }));
            expect(FoundationApi.listUsers).toHaveBeenCalledWith(
                expect.objectContaining({ name: '张三' })
            );
        });

        it('should have combobox for role filter', async () => {
            await act(async () => {
                render(<UserList />);
            });
            // Role filter select should exist
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThan(0);
        });

        it('should reset search and call listUsers without parameters', async () => {
            await act(async () => {
                render(<UserList />);
            });
            const input = screen.getByPlaceholderText('请输入用户名或姓名');
            fireEvent.change(input, { target: { value: '张三' } });
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: 'role-1' } });
            fireEvent.click(screen.getByRole('button', { name: '重置' }));
            expect(input).toHaveValue('');
            expect(FoundationApi.listUsers).toHaveBeenCalledWith({});
        });
    });
});
