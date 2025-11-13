import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import VideoCard from './components/VideoCard';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import { fetchTrendingVideos } from './services/googleSheetsService';
import type { VideoDataProcessed } from './types';
import { REFRESH_INTERVAL } from './constants';

// For using Fuse.js from CDN
declare const Fuse: any;

const App: React.FC = () => {
  const [allVideos, setAllVideos] = useState<VideoDataProcessed[]>([]);
  const [uniqueRegions, setUniqueRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<string>('all');

  const loadData = useCallback(async () => {
    // Don't show loader on background refresh
    if (allVideos.length === 0) {
      setIsLoading(true);
    }
    try {
      const { videos, regions } = await fetchTrendingVideos();
      setAllVideos(videos);
      setUniqueRegions(regions);
      setError(null);
    } catch (err) {
      setError('Failed to load video data. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [allVideos.length]);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadData]);

  const fuse = useMemo(() => {
    if (!allVideos.length) return null;
    return new Fuse(allVideos, {
      keys: ['title', 'channelName', 'bestRegion'],
      includeScore: true,
      threshold: 0.4,
    });
  }, [allVideos]);
  
  const filteredVideos = useMemo(() => {
    let videosToFilter = allVideos;

    if (searchQuery.trim() && fuse) {
      // FIX: Explicitly type the Fuse.js search result to prevent `any` from propagating
      // and causing type inference issues downstream. The result object from Fuse.js
      // contains the original item under the `item` property.
      // Correctly type the search result to break the `any` chain.
      const searchResults: { item: VideoDataProcessed }[] = fuse.search(searchQuery);
      videosToFilter = searchResults.map((result) => result.item);
    }

    return videosToFilter.filter(video => {
      const matchesRegion = selectedRegion === 'All' || video.bestRegion === selectedRegion;
      
      const now = new Date();
      const videoDate = video.publishedDate;
      let matchesTime = true;
      if (timeRange === 'week') {
        const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        matchesTime = videoDate >= oneWeekAgo;
      } else if (timeRange === 'month') {
        matchesTime = videoDate.getFullYear() === now.getFullYear() && videoDate.getMonth() === now.getMonth();
      } else if (timeRange === '3months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        matchesTime = videoDate >= threeMonthsAgo;
      } else if (timeRange === 'since_august') {
        const targetAugust = new Date(now.getFullYear(), 7, 1); // August is month 7 (0-indexed)
        if (now < targetAugust) {
            // If current date is before August of this year, use last year's August
            targetAugust.setFullYear(now.getFullYear() - 1);
        }
        matchesTime = videoDate >= targetAugust;
      }


      return matchesRegion && matchesTime;
    });
  }, [allVideos, searchQuery, selectedRegion, timeRange, fuse]);

  const groupedVideos = useMemo(() => {
    return filteredVideos.reduce((acc, video) => {
      const groupKey = video.publishedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(video);
      return acc;
    }, {} as Record<string, VideoDataProcessed[]>);
  }, [filteredVideos]);


  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    if (error) {
      return <div className="text-center text-red-500 py-10">{error}</div>;
    }
    if (filteredVideos.length === 0) {
      return <div className="text-center text-gray-500 dark:text-gray-400 py-10">No videos found.</div>;
    }
    return (
        <div className="space-y-8">
            {Object.entries(groupedVideos).map(([groupKey, videosInGroup]) => (
                <section key={groupKey} aria-labelledby={groupKey}>
                    <h2 id={groupKey} className="text-2xl font-bold text-gray-800 dark:text-gray-200 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                        {groupKey}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pt-6 animate-fade-in">
                        {videosInGroup.map((video, index) => (
                          <VideoCard key={video.id} video={video} index={index} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Controls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={uniqueRegions}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
