import { formatDistanceToNow } from 'date-fns'; // npm install date-fns (lightweight, free)

export const formatLastSeen = timestamp => {
  if (!timestamp) return 'Never';
  const date = timestamp.toDate();
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Just now'; // <1 min
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`; // <1 hr
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`; // <1 day
  return formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 days ago"
};
