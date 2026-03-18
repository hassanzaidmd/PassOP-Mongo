import React, { useEffect, useState } from 'react';


function useSearch(data, keys, delay = 300) {

    const [search,setSearch] = useState("");
    const [debouncedSearch,setDebouncedSearch] = useState("");
    const [filteredData,setFilteredData] = useState(data || []);

    useEffect( () => {
        const timer = setTimeout( () => {
            setDebouncedSearch(search);
        },delay);
        return () => clearTimeout(timer)
    },[search,delay]);

    useEffect(() => {
        const result = data.filter((item) => 
        keys.some((key) => 
        item[key]
        ?.toString()
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    ));

    setFilteredData(result)
    },[debouncedSearch,data,keys]);

  return {
    search,
    setSearch,
    filteredData
  };
}

export default useSearch
