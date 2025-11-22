import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export function ExpandedPropertyCard({
    id,
    title,
    description,
    price,
    location,
    images = [],
    onFavoriteChange,
    isFavorite = false
}) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-0">
                <div className="aspect-video relative">
                    <img
                        src={images[0] || '/placeholder-property.jpg'}
                        alt={title}
                        className="object-cover w-full h-full"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm mb-2">{location}</p>
                <p className="font-bold text-lg">${price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {description}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className={isFavorite ? "text-red-500" : ""}
                    onClick={() => onFavoriteChange?.(!isFavorite)}
                >
                    <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                </Button>
            </CardFooter>
        </Card>
    )
} 