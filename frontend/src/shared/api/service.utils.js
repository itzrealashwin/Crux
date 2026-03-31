export const unwrapData = (response) => response?.data ?? response;

export const unwrapNestedData = (response) => response?.data?.data ?? response?.data ?? response;