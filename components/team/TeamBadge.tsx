import { cn } from "@/lib/utils";

interface TeamBadgeProps {
  letters: string;
  color: string;
  className?: string;
}

export function TeamBadge({ letters, color, className }: TeamBadgeProps) {
  return (
    <div 
      className={cn("flex items-center justify-center rounded-full font-bold text-xs shadow-sm", className)}
      style={{ 
        backgroundColor: color, 
        color: getContrastColor(color),
        width: "36px",
        height: "36px"
      }}
      title={letters}
    >
      {letters}
    </div>
  );
}

// Helper to determine if text should be black or white based on background hex
export function getContrastColor(hexColor: string) {
  if (!hexColor) return '#FFFFFF';
  const hex = hexColor.replace('#', '');
  // Default to white if invalid hex
  if (hex.length !== 6) return '#FFFFFF';
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}
