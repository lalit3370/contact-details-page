import { useState } from 'react';
import styles from './Conversations.module.css';

export function MessageInput() {
  const [value, setValue] = useState('');

  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        setValue('');
      }}
    >
      <button type="button" className={styles.composerType} aria-label="Message type">
        <EmailIcon />
        <ChevronDownIcon />
      </button>

      <label className={styles.composerInputWrap}>
        <span className="sr-only">Message</span>
        <input
          type="text"
          className={styles.composerInput}
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>

      <button type="button" className={styles.composerAi} aria-label="AI assist">
        <SparkleIcon />
      </button>

      <button
        type="submit"
        className={styles.composerSend}
        aria-label="Send"
        disabled={!value.trim()}
      >
        <SendIcon />
      </button>
    </form>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l1.6 5.4 5.4 1.6-5.4 1.6-1.6 5.4-1.6-5.4-5.4-1.6 5.4-1.6L12 2.5z" />
      <path d="M19 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" opacity="0.7" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 11L21 3L13 21L11 13L3 11Z" />
    </svg>
  );
}
