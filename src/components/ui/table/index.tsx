import React, { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../../utils";

// ============================================
// 类型定义
// ============================================

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  caption?: string;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  selected?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  isHeader?: boolean;
  align?: "left" | "center" | "right";
  width?: string | number;
}

// ============================================
// Table 组件
// ============================================

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    { children, className, striped, hoverable, bordered, compact, caption, ...props },
    ref
  ) => {
    return (
      <div className="table-responsive">
        <table
          ref={ref}
          className={cn(
            "w-full text-left text-sm",
            bordered && "border border-gray-200 dark:border-gray-800",
            className
          )}
          {...props}
        >
          {caption && (
            <caption className="caption-bottom py-3 text-left text-sm text-gray-500 dark:text-gray-400">
              {caption}
            </caption>
          )}
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement, {
                striped,
                hoverable,
                compact,
              });
            }
            return child;
          })}
        </table>
      </div>
    );
  }
);

Table.displayName = "Table";

// ============================================
// TableHeader 组件
// ============================================

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          "bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = "TableHeader";

// ============================================
// TableBody 组件
// ============================================

interface TableBodyInternalProps extends TableBodyProps {
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyInternalProps>(
  (
    { children, className, emptyState, loading, loadingRows = 3, striped, hoverable, compact, ...props },
    ref
  ) => {
    // 加载状态骨架屏
    if (loading) {
      return (
        <tbody ref={ref} className={className} {...props}>
          {Array.from({ length: loadingRows }).map((_, index) => (
            <tr key={index} className={cn(compact ? "h-12" : "h-16")}>
              {Array.from({ length: 4 }).map((_, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4">
                  <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    // 空状态
    if (!children || (Array.isArray(children) && children.length === 0)) {
      return (
        <tbody ref={ref} className={className} {...props}>
          <tr>
            <td colSpan={100} className="px-6 py-12 text-center">
              {emptyState || (
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="mb-3 h-12 w-12 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm">暂无数据</p>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody
        ref={ref}
        className={cn(
          "divide-y divide-gray-200 dark:divide-gray-800",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, {
              striped: striped && index % 2 === 1,
              hoverable,
              compact,
            });
          }
          return child;
        })}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";

// ============================================
// TableRow 组件
// ============================================

interface TableRowInternalProps extends TableRowProps {
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowInternalProps>(
  (
    { children, className, selected, clickable, onClick, striped, hoverable, compact, ...props },
    ref
  ) => {
    return (
      <tr
        ref={ref}
        onClick={onClick}
        className={cn(
          // 基础样式
          "transition-colors duration-150",
          // 斑马纹
          striped && "bg-gray-50 dark:bg-gray-800/30",
          // 悬停效果
          (hoverable || clickable) && "hover:bg-gray-50 dark:hover:bg-gray-800/50",
          // 选中状态
          selected && "bg-brand-50 dark:bg-brand-500/10",
          // 可点击
          clickable && "cursor-pointer",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, { compact });
          }
          return child;
        })}
      </tr>
    );
  }
);

TableRow.displayName = "TableRow";

// ============================================
// TableCell 组件
// ============================================

interface TableCellInternalProps extends TableCellProps {
  compact?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellInternalProps>(
  (
    { children, className, isHeader, align = "left", width, compact, ...props },
    ref
  ) => {
    const CellTag = isHeader ? "th" : "td";
    
    const alignClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    return (
      <CellTag
        ref={ref}
        scope={isHeader ? "col" : undefined}
        style={{ width }}
        className={cn(
          // 基础样式
          alignClasses[align],
          // 表头样式
          isHeader && "whitespace-nowrap px-6 py-3 font-semibold tracking-wide",
          // 单元格样式
          !isHeader && cn("whitespace-nowrap", compact ? "px-4 py-2" : "px-6 py-4"),
          className
        )}
        {...props}
      >
        {children}
      </CellTag>
    );
  }
);

TableCell.displayName = "TableCell";

// ============================================
// 导出
// ============================================

export { Table, TableHeader, TableBody, TableRow, TableCell };
