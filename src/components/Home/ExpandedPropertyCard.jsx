import { BedDouble, MapPin, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge.jsx";
import { FavoriteButton } from "@/components/ui/favoriteButton";
import { Link } from "react-router-dom";
import { ReportDialog } from "@/components/ReportDialog";
import { Card } from "@/components/ui/card";

export default function ExpandedPropertyCard(props) {
  const {
    id,
    imageUrl = "/placeholder.svg?height=200&width=300",
    title = "Modern Apartment",
    price = "$450,000",
    location = "Seattle",
    bedrooms = 3,
    floors = 1,
    parking = 1,
    publisherName = "Jane Cooper",
    isNew = false,
    favorited = false,
    onFavoriteChange,
    isPending = false,
  } = props;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="group overflow-hidden hover:shadow-sm transition-all duration-300 hover:scale-[1.02]">
      <div className="relative">
        <Link to={`/property/${id}`} className="block">
          <div className="relative aspect-[3/2] overflow-hidden">
            {isNew && (
              <Badge className="absolute left-3 top-3 z-20 bg-green-600 text-white shadow-lg border-0 font-medium">
                New
              </Badge>
            )}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={title}
              width={300}
              height={200}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Favorite Button - Top Right */}
        <div
          className="absolute top-3 right-3 z-20 bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:bg-white/30 dark:hover:bg-black/40 transition-all duration-200"
          onClick={handleButtonClick}
        >
          <FavoriteButton
            isFavorited={favorited}
            onFavoriteChange={onFavoriteChange}
            isPending={isPending}
          />
        </div>

        {/* Report Button - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:bg-white/30 dark:hover:bg-black/40 transition-all duration-200">
          <ReportDialog publicationId={id} />
        </div>
      </div>

      <div className="p-5 space-y-3 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-base line-clamp-2 text-gray-900 dark:text-white leading-tight flex-1">{title}</h3>
          <p className="font-bold text-lg text-green-600 dark:text-green-400 whitespace-nowrap">{price}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">{bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">{floors}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="6" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="7.5" cy="17.5" r="1.5"/>
                <circle cx="16.5" cy="17.5" r="1.5"/>
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">{parking}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{publisherName}</div>
        </div>
      </div>
    </Card>
  );
}
