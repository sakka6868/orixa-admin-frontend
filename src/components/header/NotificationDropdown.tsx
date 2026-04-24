import { useState, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { Announcement } from "../../types/announcement.ts";
import AnnouncementApi from "../../api/AnnouncementApi.ts";
import { useCurrentStaff } from "../../hooks/useCurrentStaff.ts";
import Badge from "../ui/badge/Badge.tsx";
import useMountEffect from "../../hooks/useMountEffect.ts";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const { staff } = useCurrentStaff();

  const fetchUnreadAnnouncements = useCallback(async () => {
    if (!staff?.userId) return;
    setLoading(true);
    try {
      const unread = await AnnouncementApi.getUnreadAnnouncements();
      setAnnouncements(unread);
    } catch (error) {
      console.error("Failed to fetch unread announcements:", error);
    } finally {
      setLoading(false);
    }
  }, [staff?.userId]);

  useMountEffect(() => {
    fetchUnreadAnnouncements();
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await AnnouncementApi.markAsRead(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && staff?.userId) {
      fetchUnreadAnnouncements();
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge color="error" variant="light" size="sm">高</Badge>;
      case "NORMAL":
        return <Badge color="warning" variant="light" size="sm">普通</Badge>;
      case "LOW":
        return <Badge color="dark" variant="light" size="sm">低</Badge>;
      default:
        return <Badge color="dark" variant="light" size="sm">{priority}</Badge>;
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  const hasUnread = announcements.length > 0;

  return (
    <div className="relative">
      <button
        className="app-icon-button app-text-secondary relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
        onClick={toggleDropdown}
      >
        {hasUnread && (
          <span className="absolute right-0 top-0.5 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="app-floating-panel absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border p-3 shadow-theme-lg sm:w-[361px] lg:right-0"
      >
        <div className="app-border mb-3 flex items-center justify-between border-b pb-3">
          <h5 className="app-text-primary text-lg font-semibold">
            系统公告
            {hasUnread && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                {announcements.length}
              </span>
            )}
          </h5>
          <button
            onClick={toggleDropdown}
            className="app-text-muted transition hover:text-[color:var(--ui-text-primary)]"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading && announcements.length === 0 ? (
            <li className="flex items-center justify-center py-8 text-gray-500">
              加载中...
            </li>
          ) : announcements.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg
                className="mb-2 h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm">暂无未读公告</span>
            </li>
          ) : (
            announcements.map((announcement) => (
              <li key={announcement.id}>
                <DropdownItem
                  onItemClick={() => handleMarkAsRead(announcement.id)}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="flex w-full flex-col">
                    <span className="mb-1.5 flex items-center gap-2">
                      {getPriorityBadge(announcement.priority)}
                      <span className="font-medium text-gray-800 dark:text-white/90 line-clamp-1">
                        {announcement.title}
                      </span>
                    </span>
                    <span className="mb-1.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {announcement.content}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatTime(announcement.publishedAt)}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
        <Link
          to="/foundation/announcements"
          onClick={closeDropdown}
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          查看全部公告
        </Link>
      </Dropdown>
    </div>
  );
}
