import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { VideoDataProcessed } from '../types';
import { REGION_COLORS } from '../constants';

interface VideoCardProps {
  video: VideoDataProcessed;
  index: number;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
};


const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
  const regionColor = REGION_COLORS[video.bestRegion] || REGION_COLORS.DEFAULT;

  // Start with the highest possible resolution
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`);

  const handleThumbnailError = () => {
    // Fallback chain: maxres -> sd -> hq -> placeholder
    if (currentThumbnailUrl.includes('maxresdefault.jpg')) {
      setCurrentThumbnailUrl(`https://i.ytimg.com/vi/${video.id}/sddefault.jpg`);
    } else if (currentThumbnailUrl.includes('sddefault.jpg')) {
      setCurrentThumbnailUrl(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`);
    } else {
      // If hqdefault also fails, show a generic placeholder
      setCurrentThumbnailUrl('https://placehold.co/1280x720/1f2937/9ca3af?text=Image+Unavailable');
    }
  };

  return (
    <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative">
          <img
            src={currentThumbnailUrl}
            alt={video.title}
            className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={handleThumbnailError}
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-3xl font-bold px-3 py-1 rounded-md">
            #{video.bestRank}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight truncate group-hover:text-brand-primary dark:group-hover:text-brand-secondary">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{video.channelName}</p>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 font-semibold rounded-full ${regionColor}`}>
              {video.bestRegion}
            </span>
            <span>{video.publishedDateFormatted}</span>
          </div>
        </div>
      </a>
    </motion.div>
  );
};

export default VideoCard;