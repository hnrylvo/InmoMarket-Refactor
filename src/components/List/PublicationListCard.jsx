import Image from "next/image"
import { Heart, MapPin, Maximize2, BedDouble, Bath, Car } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PublicationListCard({
  imageUrl = "/placeholder.svg?height=400&width=600",
  title = "Modern Apartment with Ocean View",
  location = "Downtown, Seattle",
  price = "$450,000",
  bedrooms = 3,
  bathrooms = 2,
  area = "1,200 sq ft",
  parking = 1,
  publisherName = "Jane Cooper",
  publisherImageUrl = "/placeholder.svg?height=40&width=40",
  isFeatured = false,
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        {isFeatured && (
          <Badge className="absolute left-3 top-3 z-10" variant="secondary">
            Featured
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white/80 text-rose-500 backdrop-blur-sm hover:bg-white/70 hover:text-rose-600"
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to favorites</span>
        </Button>
        <div className="aspect-video overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold leading-tight text-lg">{title}</h3>
            <p className="font-bold text-lg">{price}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="flex flex-col items-center rounded-md border p-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex flex-col items-center rounded-md border p-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex flex-col items-center rounded-md border p-2">
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
            <span>{area}</span>
          </div>
          <div className="flex flex-col items-center rounded-md border p-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>{parking}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={publisherImageUrl || "/placeholder.svg"} alt={publisherName} />
            <AvatarFallback>{publisherName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="leading-none">{publisherName}</p>
            <p className="text-xs text-muted-foreground">Property Agent</p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
