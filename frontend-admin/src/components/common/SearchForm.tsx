import { useState, useEffect } from 'react';

interface SearchFormProps {
  onSearch: (search: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SearchForm({
  onSearch,
  placeholder = '検索...',
  initialValue = '',
}: SearchFormProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button type="button" className="search-clear" onClick={handleClear}>
          &times;
        </button>
      )}
      <button type="submit" className="btn btn-sm">
        検索
      </button>
    </form>
  );
}
