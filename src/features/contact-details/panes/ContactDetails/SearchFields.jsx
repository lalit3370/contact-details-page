import { notImplemented } from '@/shared/utils.js';
import { SearchIcon, FilterIcon } from '@/shared/Icons.jsx';
import styles from './ContactDetails.module.css';

export function SearchFields({ value, onChange }) {
  return (
    <div className={styles.searchRow} role="search">
      <div className={styles.searchInputWrap}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search Fields and Folders"
          aria-label="Search Fields and Folders"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={styles.searchFilterBtn}
          aria-label="Filter"
          onClick={notImplemented('Filter')}
        >
          <FilterIcon />
        </button>
      </div>
    </div>
  );
}
