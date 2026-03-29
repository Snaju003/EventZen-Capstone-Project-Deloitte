import { motion } from "framer-motion";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function EventsPaginationBar({ onNext, onPrevious, pagination }) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="surface-card mt-6 flex items-center justify-between gap-3 px-4 py-3"
    >
      <p className="text-sm text-slate-600">
        Page {pagination.page} of {pagination.totalPages} &bull; {pagination.total} events
      </p>
      <Pagination className="w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={pagination.page > 1 ? onPrevious : undefined}
              className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((page) => {
              // Show first, last, current, and adjacent pages
              return page === 1
                || page === pagination.totalPages
                || Math.abs(page - pagination.page) <= 1;
            })
            .reduce((acc, page, index, arr) => {
              if (index > 0 && page - arr[index - 1] > 1) {
                acc.push("ellipsis-" + page);
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item) =>
              typeof item === "string" ? (
                <PaginationItem key={item}>
                  <span className="px-1 text-xs text-slate-400">…</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={item === pagination.page}
                    onClick={() => {
                      if (item < pagination.page) {
                        for (let i = 0; i < pagination.page - item; i++) onPrevious();
                      } else if (item > pagination.page) {
                        for (let i = 0; i < item - pagination.page; i++) onNext();
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

          <PaginationItem>
            <PaginationNext
              onClick={pagination.hasNext ? onNext : undefined}
              className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
}
