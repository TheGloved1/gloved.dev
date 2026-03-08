import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps): React.JSX.Element {
  if (totalPages <= 1) {
    return <></>;
  }

  return (
    <Pagination className='mx-auto w-full'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className={
              currentPage === 1 ?
                'pointer-events-none opacity-50'
              : 'cursor-pointer border border-white/10 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
            }
          />
        </PaginationItem>

        {/* Generate page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                  className={`${page === currentPage ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400' : 'cursor-pointer border border-white/10 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'}`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          }

          // Show ellipsis for gaps
          if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis className='text-white/50' />
              </PaginationItem>
            );
          }

          return null;
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className={
              currentPage === totalPages ?
                'pointer-events-none opacity-50'
              : 'cursor-pointer border border-white/10 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
