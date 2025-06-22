import { useState, useEffect } from 'react';

export function useUrlParams() {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    const updateParams = () => {
      setParams(new URLSearchParams(window.location.search));
    };

    // Initial load
    updateParams();

    // Listen for URL changes
    window.addEventListener('popstate', updateParams);
    
    return () => {
      window.removeEventListener('popstate', updateParams);
    };
  }, []);

  const getParam = (key: string): string | null => {
    return params.get(key);
  };

  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(key, value);
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    setParams(newParams);
  };

  const removeParam = (key: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete(key);
    const newUrl = newParams.toString() 
      ? `${window.location.pathname}?${newParams.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    setParams(newParams);
  };

  return { getParam, setParam, removeParam, params };
}