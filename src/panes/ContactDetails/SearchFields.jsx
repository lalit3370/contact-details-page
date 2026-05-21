import styles from './ContactDetails.module.css';

export function SearchFields({ value, onChange }) {
  return (
    <div className={styles.searchRow}>
      <label className={styles.searchInputWrap}>
        <span className="sr-only">Search Fields and Folders</span>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search Fields and Folders"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={styles.searchFilterBtn}
          aria-label="Filter"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 4H14M4 8H12M6 12H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </label>
    </div>
  );
}
