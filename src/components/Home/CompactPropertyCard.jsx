import { BedDouble, Bath, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export default function CompactPropertyCard({
                                              id = "property-123",
                                              imageUrl = "/placeholder.svg?height=120&width=160",
                                              title = "Modern Apartment",
                                              price = "$450,000",
                                              location = "Seattle",
                                              bedrooms = 3,
                                              bathrooms = 2,
                                              publisherName = "Jane Cooper",
                                              isNew = false,
                                            }) {
  return (
    <Link to={`/property/${id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
        <div className="flex h-full">
          <div className="relative w-1/3 min-w-[120px] overflow-hidden">
            {isNew && (
              <Badge className="absolute left-2 top-2 z-10 bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md">
                New
              </Badge>
            )}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={title}
              width={160}
              height={120}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* Removed gradient overlay and hover opacity */}
          </div>
          <CardContent className="flex flex-col justify-between p-4 w-2/3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {title}
                </h3>
                <p className="font-bold text-sm whitespace-nowrap bg-muted px-2 py-1 rounded-md">
                  {price}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1 font-medium">{location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
                  <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{bedrooms}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
                  <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{bathrooms}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
                {publisherName}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
