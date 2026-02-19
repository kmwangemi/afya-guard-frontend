import { DecodedToken } from '@/types/common';
import { clsx, type ClassValue } from 'clsx';
import { formatDate, formatDistanceToNowStrict } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(createdAt: Date) {
  const currentDate = new Date();
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000; // One year in milliseconds
  if (currentDate.getTime() - createdAt.getTime() <= oneYearInMs) {
    // Return relative time if difference is less than or equal to 1 year
    return formatDistanceToNowStrict(createdAt, { addSuffix: true });
  }
  // Return full date with year if difference is more than 1 year
  return formatDate(createdAt, 'MMM d, yyyy');
}
export const capitalizeFirstLetter = (str: string) => {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.substring(1);
};
export const firstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0);
};
export const formatToNewDate = (date: Date | string): string => {
  if (!date) return '';
  return formatDate(date, 'dd/MM/yyyy');
};
export const capitalizeFirstLetterOfEachWord = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
export const formatNotificationCount = (count: number) => {
  // You can customize the threshold as needed
  const threshold = 99;
  if (count > threshold) {
    return `${threshold}+`;
  }
  return count.toString();
};
export const decodeToken = (
  token: string | undefined | null,
): DecodedToken | null | unknown => {
  try {
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    }
    return null;
  } catch (error) {
    // console.error('Error decoding token:', error);
    // You can handle the error case here, such as returning a default value or throwing an exception
    return null; // or throw new Error('Failed to decode token');
  }
};
export const addCommasToNumber = (input: string | number): string => {
  // Convert the input to a number if it's a string
  const number: number =
    typeof input === 'string' ? parseFloat(input) : Number(input);
  // Check if the conversion was successful
  if (Number.isNaN(number)) {
    return '0';
  }
  // Convert the number to a string
  let numberString: string = number.toString();
  // Handle negative numbers
  let isNegative = false;
  if (number < 0) {
    isNegative = true;
    numberString = numberString.slice(1); // Remove the negative sign for processing
  }
  // Use a regular expression to add commas to the string
  numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Add back the negative sign if needed
  if (isNegative) {
    numberString = `-${numberString}`;
  }
  return numberString;
};
export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }
  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
export const stringToBool = (str: string): boolean => {
  return str.toLowerCase() === 'true';
};
