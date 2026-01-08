import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const SearchableDropdown = ({ selectedRepo, setSelectedRepo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [repoData, setRepoData] = useState([]);

  // Fetch all repos on mount
  useEffect(() => {
    const fetchRepos = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:3004/my-repos`, { withCredentials: true });
        const allRepos = (Array.isArray(response.data) ? response.data : []).map((repo) => ({
          label: repo.name,
          value: repo.html_url,
        }));
        setRepoData(allRepos);
      } catch (error) {
        console.error('Error fetching data from GitHub API:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepos();
  }, []);

  // Filter repoData on input
  const [filteredRepos, setFilteredRepos] = useState([]);
  const handleInputChange = (inputValue) => {
    if (!inputValue) {
      setFilteredRepos([]);
      return;
    }
    const filtered = repoData.filter(repo =>
      repo.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredRepos(filtered);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#111',
      borderColor: state.isFocused ? '#555' : '#333',
      color: 'white',
      borderRadius: '0.375rem', // tailwind rounded-md
      padding: '2px',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#444'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '0.375rem',
      marginTop: '4px',
      color: 'white'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#333' : state.isFocused ? '#222' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#444'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    input: (provided) => ({
      ...provided,
      color: 'white'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6b7280'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#9ca3af'
      }
    })
  };

  return (
    <div>
      <Select
        isClearable
        isLoading={isLoading}
        onInputChange={handleInputChange}
        options={filteredRepos.length > 0 ? filteredRepos : repoData}
        placeholder="Search for a GitHub repo..."
        noOptionsMessage={() => (isLoading ? 'Loading...' : 'No repositories found')}
        styles={customStyles}
        getOptionLabel={(e) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{e.label}</span>
            <span className="text-xs text-gray-500 truncate">{e.value}</span>
          </div>
        )}
        value={selectedRepo}
        onChange={setSelectedRepo}
      />
    </div>
  );
};

export default SearchableDropdown;
