import { useContext } from 'react';
import CommentContext from '../CommentContext';

// Custom hook to use the comment context
export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
}; 