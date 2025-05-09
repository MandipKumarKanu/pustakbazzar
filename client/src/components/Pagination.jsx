import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only 1 page
  if (totalPages <= 1) {
    return null;
  }

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Always include last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md flex items-center justify-center ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Previous page"
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>
      
      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => handlePageClick(page)}
          className={`w-10 h-10 rounded-md flex items-center justify-center ${
            page === currentPage
              ? 'bg-primaryColor text-white'
              : page === '...'
              ? 'text-gray-500 cursor-default'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md flex items-center justify-center ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Next page"
      >
        <FaChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;