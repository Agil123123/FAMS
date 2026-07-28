// ==========================================================
// Paginated Response DTO
// ==========================================================

export class PaginationMeta {
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class PaginatedResponseDto<T> {
  data!: T[];
  meta!: PaginationMeta;
}
