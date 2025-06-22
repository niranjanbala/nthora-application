import React, { useState, useEffect } from 'react';
import { Badge } from '../../types/badges';
import { BadgeService } from '../../services/badgeService';
import BadgeNotification from './BadgeNotification';

interface BadgeNotificationManagerProps {
  checkInterval?: number; // in milliseconds
}

const BadgeNotificationManager: React.FC<BadgeNotificationManagerProps> = ({
  checkInterval = 60000 // Check every minute by default
}) => {
  const [notifications, setNotifications] = useState<Badge[]>([]);
  const [lastCheckedBadges, setLastCheckedBadges] = useState<Record<string, boolean>>({});

  // Check for newly earned badges
  const checkForNewBadges = () => {
    const currentBadges = BadgeService.getUserBadges();
    const newlyEarned: Badge[] = [];

    currentBadges.forEach(badge => {
      // If badge is earned and wasn't previously earned, add to notifications
      if (badge.earnedAt && !lastCheckedBadges[badge.id]) {
        newlyEarned.push(badge);
      }
    });

    // Update last checked badges
    const newCheckedBadges: Record<string, boolean> = {};
    currentBadges.forEach(badge => {
      newCheckedBadges[badge.id] = !!badge.earnedAt;
    });
    setLastCheckedBadges(newCheckedBadges);

    // Add new notifications
    if (newlyEarned.length > 0) {
      setNotifications(prev => [...prev, ...newlyEarned]);
    }
  };

  // Initialize on mount
  useEffect(() => {
    // Initialize lastCheckedBadges
    const initialBadges = BadgeService.getUserBadges();
    const initialCheckedBadges: Record<string, boolean> = {};
    initialBadges.forEach(badge => {
      initialCheckedBadges[badge.id] = !!badge.earnedAt;
    });
    setLastCheckedBadges(initialCheckedBadges);

    // Set up interval to check for new badges
    const intervalId = setInterval(checkForNewBadges, checkInterval);
    
    return () => clearInterval(intervalId);
  }, [checkInterval]);

  // Remove a notification
  const removeNotification = (badgeId: string) => {
    setNotifications(prev => prev.filter(badge => badge.id !== badgeId));
  };

  // Only show the first notification
  const currentNotification = notifications[0];

  return (
    <>
      {false && (
        <BadgeNotification
          badge={currentNotification}
          onClose={() => removeNotification(currentNotification.id)}
          autoClose={true}
          duration={8000}
        />
      )}
    </>
  );
};

export default BadgeNotificationManager;