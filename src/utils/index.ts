import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名的工具函数
 * 
 * 此函数结合了 clsx 和 tailwind-merge 的功能：
 * - clsx: 条件性地合并类名，支持字符串、对象、数组等多种输入格式
 * - tailwind-merge: 解决 Tailwind CSS 类名冲突问题，确保相同属性的类名后者覆盖前者
 * 
 * @param inputs - 可变参数，接受任意数量的类名值
 * @returns 合并后的类名字符串
 * 
 * @example
 * cn('text-red-500', 'bg-blue-500', { 'font-bold': true })
 * // 返回类似 'text-red-500 bg-blue-500 font-bold' 的字符串
 * 
 * @example
 * cn('px-2 py-1', 'px-4')
 * // 返回 'py-1 px-4'，后面的 px-4 覆盖了前面的 px-2
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
