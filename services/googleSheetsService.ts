import { GOOGLE_SHEET_URL } from '../constants';
import type { VideoDataRaw, GoogleSheetData, VideoDataProcessed } from '../types';

function parseDateFromSheet(dateValue: any, dateFormatted: string | null): Date {
    if (dateFormatted) {
        // The format is "Date(YYYY,MM,DD)"
        const match = dateFormatted.match(/Date\((\d+),(\d+),(\d+)/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10); // Month is 0-indexed in JS Date constructor
            const day = parseInt(match[3], 10);
            return new Date(year, month, day);
        }
    }
    // Fallback if 'f' value is missing or doesn't match
    if (dateValue instanceof Date) {
        return dateValue;
    }
    if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    // Return a default past date if parsing fails
    return new Date(0);
}

export const fetchTrendingVideos = async (): Promise<{ videos: VideoDataProcessed[], regions: string[] }> => {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    let text = await response.text();
    
    // The response is JSONP, so we need to extract the JSON part.
    const jsonString = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s)?.[1];
    if (!jsonString) {
        throw new Error('Failed to parse Google Sheet JSONP response.');
    }

    const data: GoogleSheetData = JSON.parse(jsonString);
    
    if (!data.table || !data.table.rows) {
        throw new Error("No data found in sheet or sheet is empty.");
    }

    const rawData: VideoDataRaw[] = data.table.rows.map(row => ({
      rank: Number(row.c[0]?.v) || 0,
      title: String(row.c[1]?.v) || '',
      description: String(row.c[2]?.v) || '',
      publishedDate: parseDateFromSheet(row.c[3]?.v, row.c[3]?.f),
      videoId: String(row.c[4]?.v) || '',
      videoUrl: String(row.c[5]?.v) || '',
      channelName: String(row.c[6]?.v) || '',
      thumbnails: String(row.c[7]?.v) || '{}',
      outputDate: String(row.c[8]?.v) || '',
      trendingRegion: String(row.c[9]?.v) || '',
    })).filter(item => item.videoId && item.rank > 0);

    return processData(rawData);

  } catch (error) {
    console.error("Failed to fetch or process data from Google Sheet:", error);
    throw error;
  }
};

const processData = (rawData: VideoDataRaw[]): { videos: VideoDataProcessed[], regions: string[] } => {
    const videoMap = new Map<string, VideoDataRaw>();
    const regionSet = new Set<string>();

    rawData.forEach(video => {
        if(video.trendingRegion) regionSet.add(video.trendingRegion);
        const existingVideo = videoMap.get(video.videoId);
        if (!existingVideo || video.rank < existingVideo.rank) {
            videoMap.set(video.videoId, video);
        }
    });

    const processedVideos: VideoDataProcessed[] = Array.from(videoMap.values()).map(v => ({
      id: v.videoId,
      bestRank: v.rank,
      title: v.title,
      channelName: v.channelName,
      videoUrl: v.videoUrl,
      publishedDate: v.publishedDate,
      publishedDateFormatted: v.publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      bestRegion: v.trendingRegion,
    }));

    processedVideos.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    const regions = Array.from(regionSet).sort();
    
    return { videos: processedVideos, regions };
}