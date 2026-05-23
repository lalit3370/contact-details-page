import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatClockTime } from '@/shared/utils.js';
import { EmailIcon, ChevronDownIcon, SparkleIcon, SendIcon } from '@/shared/Icons.jsx';
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
        <ChevronDownIcon size={10} />
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
