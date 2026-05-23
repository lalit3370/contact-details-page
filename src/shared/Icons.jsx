// Shared SVG icon components. Each renders a single <svg> with a canonical
// size and viewBox, spreads any extra props to the root <svg> (so callers
// can pass className, data-* attributes, or override aria-hidden), and
// defaults to aria-hidden="true" since icons almost always accompany text.

export function ConversationsIcon(props) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4.5C2 3.67 2.67 3 3.5 3H12.5C13.33 3 14 3.67 14 4.5V10C14 10.83 13.33 11.5 12.5 11.5H7L4 13.5V11.5H3.5C2.67 11.5 2 10.83 2 10V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Default size 12 matches header/section chevrons. Pass `size={10}` for
// the smaller composer-quick-action variant.
export function ChevronDownIcon({ size = 12, ...rest }) {
  return (
    <svg {...rest} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg {...props} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 4L6 8L10 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg {...props} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Folder chevron — points up by default. Folder rotates it via
// `data-open='false'` in CSS when collapsed.
export function ChevronUpIcon(props) {
  return (
    <svg {...props} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 10L8 6L12 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmailIcon(props) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon(props) {
  return (
    <svg
      {...props}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l1.6 5.4 5.4 1.6-5.4 1.6-1.6 5.4-1.6-5.4-5.4-1.6 5.4-1.6L12 2.5z" />
      <path d="M19 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" opacity="0.7" />
    </svg>
  );
}

export function SendIcon(props) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 11L21 3L13 21L11 13L3 11Z" />
    </svg>
  );
}

export function WhatsAppIcon(props) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#25D366"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21l1.65-4.95A8 8 0 1 1 8 19.4L3 21z" />
      <path d="M9 9c0 .5 .25 1.5 1 2.5s2 1.75 2.5 2c.5.25 1 .25 1.5 0l.5-.5 1.5 1 -.5 .75c-.5 .5-1.5 .75-2.5 .25 -1.25-.5-2.75-1.5-3.75-2.75 -.5-.75-1-2-.25-2.75z" />
    </svg>
  );
}

export function GearIcon(props) {
  return (
    <svg {...props} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1L9 3L11 2.5L11.5 4.5L13.5 5L13 7L14.5 8.5L13 10L13.5 12L11.5 11.5L11 13.5L9 13L8 15L7 13L5 13.5L4.5 11.5L2.5 12L3 10L1.5 8.5L3 7L2.5 5L4.5 4.5L5 2.5L7 3L8 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon(props) {
  return (
    <svg {...props} width="12" height="12" viewBox="0 0 16 16" fill="#facc15" aria-hidden="true">
      <path
        d="M8 1L10 6L15 6L11 9L13 14L8 11L3 14L5 9L1 6L6 6L8 1Z"
        stroke="#facc15"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReplyArrowIcon(props) {
  return (
    <svg {...props} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M7 4L3 8L7 12M3 8H10C12 8 13 9 13 11V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KebabIcon(props) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon(props) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4H14M4 8H12M6 12H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExpandIcon(props) {
  return (
    <svg {...props} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 9V13H7M13 7V3H9M3 13L7 9M13 3L9 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon(props) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 3.5C3 2.67 3.67 2 4.5 2H5.5L6.5 4.5L5 5.5C5.5 7 7 8.5 8.5 9L9.5 7.5L12 8.5V9.5C12 10.33 11.33 11 10.5 11C6.36 11 3 7.64 3 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
