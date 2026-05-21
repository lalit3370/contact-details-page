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
      <button type="button" className={styles.composerIconBtn} aria-label="Attach">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8V4.5C3 3.12 4.12 2 5.5 2C6.88 2 8 3.12 8 4.5V10C8 10.55 7.55 11 7 11C6.45 11 6 10.55 6 10V5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
      <button type="button" className={styles.composerIconBtn} aria-label="AI">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z" opacity=".7" />
        </svg>
      </button>
      <button
        type="submit"
        className={styles.composerSend}
        aria-label="Send"
        disabled={!value.trim()}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 8L14 2L11 14L8 10L2 8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
}
