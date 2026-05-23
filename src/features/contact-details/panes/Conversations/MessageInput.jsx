import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatClockTime } from '@/shared/utils.js';
import { qk } from '../../api/queryKeys.js';
import styles from './Conversations.module.css';

export const MessageInput = forwardRef(function MessageInput({ contactId }, ref) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const qc = useQueryClient();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || !contactId) return;
    qc.setQueryData(qk.conversations(contactId), (prev) => {
      if (!prev) return prev;
      const now = new Date();
      return {
        ...prev,
        items: [
          ...(prev.items ?? []),
          {
            kind: 'chat',
            id: `local-${now.getTime()}`,
            sender: { name: 'Me' },
            timestamp: formatClockTime(now),
            body: trimmed,
          },
        ],
      };
    });
    setValue('');
  };

  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <button type="button" className={styles.composerType} aria-label="Message type">
        <EmailIcon />
        <ChevronDownIcon />
      </button>

      <label className={styles.composerInputWrap}>
        <span className="sr-only">Message</span>
        <input
          ref={inputRef}
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
});

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
