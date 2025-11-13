export interface VideoDataRaw {
  rank: number;
  title: string;
  description: string;
  publishedDate: Date;
  videoId: string;
  videoUrl: string;
  channelName: string;
  thumbnails: string; // JSON string from sheet
  outputDate: string;
  trendingRegion: string;
}

export interface VideoDataProcessed {
  id: string;
  bestRank: number;
  title: string;
  channelName: string;
  videoUrl: string;
  publishedDate: Date; // Date object for sorting/filtering
  publishedDateFormatted: string; // String for display
  bestRegion: string;
}

export interface GoogleSheetRow {
  c: ({ v: string | number | null; f?: string | null })[];
}

export interface GoogleSheetData {
  table: {
    cols: any[];
    rows: GoogleSheetRow[];
  };
}