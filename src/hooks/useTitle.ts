import { useEffect } from 'react';

function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export default useTitle;