export interface Pagination {
  CurrentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export class PaginatedResults<T> {
  data: T;
  pagination: Pagination;

  constructor(data: T, pagination: Pagination) {
    this.data = data;
    this.pagination = pagination;
  }
}

export class PagingParam {
  pageNumber;
  pageSize;

  constructor(pagenumber = 1, pagesize = 2) {
    this.pageNumber = pagenumber;
    this.pageSize = pagesize;
  }
}
