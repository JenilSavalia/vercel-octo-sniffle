import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const SearchableDropdown = ({selectedRepo,setSelectedRepo}) => {
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

  return (
    <div>
      {/* <h2>Search GitHub Repositories</h2> */}
      <Select
        isClearable
        isLoading={isLoading}
        onInputChange={handleInputChange}
        options={filteredRepos.length > 0 ? filteredRepos : repoData}
        placeholder="Search for a GitHub repo..."
        noOptionsMessage={() => (isLoading ? 'Loading...' : 'No repositories found')}
        getOptionLabel={(e) => (
          <div>
            <strong>{e.label}</strong>
            <div>{e.value}</div>
          </div>
        )}
        value={selectedRepo}
        onChange={setSelectedRepo}
      />
      {selectedRepo && (
        <div style={{ marginTop: 16 }}>
          <strong>Selected Repo:</strong> {selectedRepo.value}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
