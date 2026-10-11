const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

const SearchBar = ({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) => {
  return (
    <div className="search-filters-wrapper">
      <div className="search-filters">
        <div className="search-input-wrap">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search products by name or tag..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {search && (
            <button
              className="clear-search-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-select-wrap">
          <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <select
            className="filter-select"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item === "All Categories" ? "" : item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-wrap">
          <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="11" y1="5" x2="6" y2="10"></line>
            <line x1="11" y1="5" x2="16" y2="10"></line>
            <line x1="11" y1="5" x2="11" y2="19"></line>
          </svg>
          <select
            className="filter-select"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills">
        {CATEGORIES.map((cat) => {
          const val = cat === "All Categories" ? "" : cat;
          const isSelected = category === val;
          return (
            <button
              key={cat}
              className={`category-pill ${isSelected ? "active" : ""}`}
              onClick={() => onCategoryChange(val)}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
