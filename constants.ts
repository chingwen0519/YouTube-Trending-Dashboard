// IMPORTANT: Replace with your actual Google Sheet ID and Sheet Name.
// The sheet must be publicly accessible ("Anyone with the link can view").
const GOOGLE_SHEET_ID = '1c7d_1_oIFsfCGBrl9LRV0pyzjGc4DjalNgSZ4T45Q9w'; // User-provided ID
const SHEET_NAME = 'Sheet1'; // Default sheet name

export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

export const REGION_COLORS: { [key: string]: string } = {
  US: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  GB: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  JP: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  KR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  DE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  FR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  CA: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  TW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  HK: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours