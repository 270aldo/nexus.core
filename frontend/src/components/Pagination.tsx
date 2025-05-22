import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate page buttons
  const generatePagination = () => {
    const pages = [];
    const maxVisibleButtons = 5;

    // Always show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) {
        pages.push("...");
      }
    }

    // Calculate visible page range
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    // Adjust if at the beginning or end
    if (currentPage <= 2) {
      endPage = Math.min(totalPages, maxVisibleButtons);
    } else if (currentPage >= totalPages - 1) {
      startPage = Math.max(1, totalPages - maxVisibleButtons + 1);
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {generatePagination().map((page, i) => (
        <React.Fragment key={i}>
          {page === "..." ? (
            <span className="px-3 py-2">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
