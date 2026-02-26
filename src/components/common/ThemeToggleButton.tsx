import type React from "react";
import { useTheme } from "../../context/useTheme";

type ThemeOption = "light" | "dark" | "asuka";

const themeLabelMap: Record<ThemeOption, string> = {
  light: "Light Theme",
  dark: "Dark Theme",
  asuka: "Asuka Theme",
};

const themeOrder: ThemeOption[] = ["light", "dark", "asuka"];

const getNextThemeLabel = (theme: ThemeOption): string => {
  const currentIndex = themeOrder.indexOf(theme);
  const nextIndex = (currentIndex + 1) % themeOrder.length;
  return themeLabelMap[themeOrder[nextIndex]];
};

const ThemeIcon: React.FC<{ theme: ThemeOption }> = ({ theme }) => {
  if (theme === "light") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.99998 1.5415C10.4142 1.5415 10.75 1.87729 10.75 2.2915V3.5415C10.75 3.95572 10.4142 4.2915 9.99998 4.2915C9.58577 4.2915 9.24998 3.95572 9.24998 3.5415V2.2915C9.24998 1.87729 9.58577 1.5415 9.99998 1.5415ZM10.0009 6.79327C8.22978 6.79327 6.79402 8.22904 6.79402 10.0001C6.79402 11.7712 8.22978 13.207 10.0009 13.207C11.772 13.207 13.2078 11.7712 13.2078 10.0001C13.2078 8.22904 11.772 6.79327 10.0009 6.79327ZM5.29402 10.0001C5.29402 7.40061 7.40135 5.29327 10.0009 5.29327C12.6004 5.29327 14.7078 7.40061 14.7078 10.0001C14.7078 12.5997 12.6004 14.707 10.0009 14.707C7.40135 14.707 5.29402 12.5997 5.29402 10.0001ZM15.9813 5.08035C16.2742 4.78746 16.2742 4.31258 15.9813 4.01969C15.6884 3.7268 15.2135 3.7268 14.9207 4.01969L14.0368 4.90357C13.7439 5.19647 13.7439 5.67134 14.0368 5.96423C14.3297 6.25713 14.8045 6.25713 15.0974 5.96423L15.9813 5.08035ZM18.4577 10.0001C18.4577 10.4143 18.1219 10.7501 17.7077 10.7501H16.4577C16.0435 10.7501 15.7077 10.4143 15.7077 10.0001C15.7077 9.58592 16.0435 9.25013 16.4577 9.25013H17.7077C18.1219 9.25013 18.4577 9.58592 18.4577 10.0001ZM14.9207 15.9806C15.2135 16.2735 15.6884 16.2735 15.9813 15.9806C16.2742 15.6877 16.2742 15.2128 15.9813 14.9199L15.0974 14.036C14.8045 13.7431 14.3297 13.7431 14.0368 14.036C13.7439 14.3289 13.7439 14.8038 14.0368 15.0967L14.9207 15.9806ZM9.99998 15.7088C10.4142 15.7088 10.75 16.0445 10.75 16.4588V17.7088C10.75 18.123 10.4142 18.4588 9.99998 18.4588C9.58577 18.4588 9.24998 18.123 9.24998 17.7088V16.4588C9.24998 16.0445 9.58577 15.7088 9.99998 15.7088ZM5.96356 15.0972C6.25646 14.8043 6.25646 14.3295 5.96356 14.0366C5.67067 13.7437 5.1958 13.7437 4.9029 14.0366L4.01902 14.9204C3.72613 15.2133 3.72613 15.6882 4.01902 15.9811C4.31191 16.274 4.78679 16.274 5.07968 15.9811L5.96356 15.0972ZM4.29224 10.0001C4.29224 10.4143 3.95645 10.7501 3.54224 10.7501H2.29224C1.87802 10.7501 1.54224 10.4143 1.54224 10.0001C1.54224 9.58592 1.87802 9.25013 2.29224 9.25013H3.54224C3.95645 9.25013 4.29224 9.58592 4.29224 10.0001ZM5.96356 4.90357C6.25646 5.19647 6.25646 5.67134 5.96356 5.96423C5.67067 6.25713 5.1958 6.25713 4.9029 5.96423L4.01902 5.08035C3.72613 4.78746 3.72613 4.31258 4.01902 4.01969C4.31191 3.7268 4.78679 3.7268 5.07968 4.01969L5.96356 4.90357Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (theme === "asuka") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 2L11.5 7H16.5L12.5 10.5L14 15.5L10 12L6 15.5L7.5 10.5L3.5 7H8.5L10 2Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.4547 11.97L18.1799 12.1611C18.265 11.8383 18.1265 11.4982 17.8401 11.3266C17.5538 11.1551 17.1885 11.1934 16.944 11.4207L17.4547 11.97ZM8.0306 2.5459L8.57989 3.05657C8.80718 2.81209 8.84554 2.44682 8.67398 2.16046C8.50243 1.8741 8.16227 1.73559 7.83948 1.82066L8.0306 2.5459ZM12.9154 13.0035C9.64678 13.0035 6.99707 10.3538 6.99707 7.08524H5.49707C5.49707 11.1823 8.81835 14.5035 12.9154 14.5035V13.0035ZM16.944 11.4207C15.8869 12.4035 14.4721 13.0035 12.9154 13.0035V14.5035C14.8657 14.5035 16.6418 13.7499 17.9654 12.5193L16.944 11.4207ZM16.7295 11.7789C15.9437 14.7607 13.2277 16.9586 10.0003 16.9586V18.4586C13.9257 18.4586 17.2249 15.7853 18.1799 12.1611L16.7295 11.7789ZM10.0003 16.9586C6.15734 16.9586 3.04199 13.8433 3.04199 10.0003H1.54199C1.54199 14.6717 5.32892 18.4586 10.0003 18.4586V16.9586ZM3.04199 10.0003C3.04199 6.77289 5.23988 4.05695 8.22173 3.27114L7.83948 1.82066C4.21532 2.77574 1.54199 6.07486 1.54199 10.0003H3.04199ZM6.99707 7.08524C6.99707 5.52854 7.5971 4.11366 8.57989 3.05657L7.48132 2.03522C6.25073 3.35885 5.49707 5.13487 5.49707 7.08524H6.99707Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const ThemeToggleButton: React.FC = () => {
  const { theme, cycleTheme } = useTheme();
  const activeLabel = themeLabelMap[theme];
  const nextLabel = getNextThemeLabel(theme);

  const toneClasses =
    theme === "dark"
      ? "border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-600 hover:bg-gray-800"
      : theme === "asuka"
        ? "border-[#8b3a43] bg-[#2d1418] text-[#ff7f75] hover:border-[#b24f58] hover:bg-[#3b161d]"
        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`app-icon-button relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border shadow-theme-xs transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${toneClasses}`}
      title={`Current: ${activeLabel}. Switch to: ${nextLabel}.`}
      aria-label={`Switch theme. Current: ${activeLabel}. Next: ${nextLabel}.`}
      aria-live="polite"
    >
      <span
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/18 via-transparent to-transparent opacity-70"
        aria-hidden="true"
      />
      <span
        className="relative inline-flex items-center justify-center transition-transform duration-300 ease-out"
        aria-hidden="true"
      >
        <ThemeIcon theme={theme} />
      </span>
      <span className="sr-only">{`Current theme: ${activeLabel}`}</span>
    </button>
  );
};
