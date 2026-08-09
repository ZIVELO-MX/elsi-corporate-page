export const ADMIN_PAGE_SIZE_DEFAULT = 25;
export const ADMIN_PAGE_SIZE_MAX = 100;

export type AdminQuery = {
  page: number;
  pageSize: number;
  from: number;
  to: number;
  search: string;
  sort: string;
  ascending: boolean;
  filters: URLSearchParams;
};

export function parseAdminQuery(request: Request, allowedSorts: readonly string[], defaultSort: string): AdminQuery {
  const filters = new URL(request.url).searchParams;
  const page = positiveInteger(filters.get("page"), 1);
  const pageSize = Math.min(ADMIN_PAGE_SIZE_MAX, positiveInteger(filters.get("pageSize"), ADMIN_PAGE_SIZE_DEFAULT));
  const requestedSort = filters.get("sort") ?? defaultSort;
  const sort = allowedSorts.includes(requestedSort) ? requestedSort : defaultSort;
  const ascending = filters.get("direction") === "asc";
  const search = (filters.get("q") ?? "").trim().slice(0, 160);
  const from = (page - 1) * pageSize;

  return { page, pageSize, from, to: from + pageSize - 1, search, sort, ascending, filters };
}

export function adminPage<T>(items: T[], total: number | null, query: AdminQuery) {
  const resolvedTotal = total ?? items.length;
  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total: resolvedTotal,
      totalPages: resolvedTotal === 0 ? 0 : Math.ceil(resolvedTotal / query.pageSize),
    },
  };
}

export function escapePostgrestSearch(value: string) {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}

function positiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
