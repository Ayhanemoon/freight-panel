export interface ListQueryParams {
  page?: number;
  ordering?: string;
  search?: string;
}

export const buildQueryString = (
  params?: ListQueryParams | void
): string => {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
};