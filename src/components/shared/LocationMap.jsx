import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const DEFAULT_CENTER = [13.7942, -88.8965]
const DEFAULT_ZOOM = 8

const LocationMarker = ({ position, onPositionChange }) => {
    const map = useMapEvents({
        click(e) {
            console.log('LocationMarker - Map clicked:', e.latlng)
            onPositionChange(e.latlng)
        },
    })

    return position ? (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    console.log('LocationMarker - Marker dragged:', e.target.getLatLng())
                    onPositionChange(e.target.getLatLng())
                },
            }}
        />
    ) : null
}

export default function LocationMap({ onLocationChange, initialPosition, initialAddress }) {
    const [position, setPosition] = useState(initialPosition || null)
    const [address, setAddress] = useState({
        municipality: initialAddress?.municipality || '',
        department: initialAddress?.department || '',
    })
    const [isLoading, setIsLoading] = useState(false)

    const fetchAddress = async (latlng) => {
        if (!latlng) return
        
        setIsLoading(true)
        try {
            // Use Vite proxy in development, or direct call in production
            const isDevelopment = import.meta.env.DEV
            const baseUrl = isDevelopment 
                ? '/api/nominatim' 
                : 'https://nominatim.openstreetmap.org'
            
            const url = `${baseUrl}/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
            
            const response = await fetch(url, {
                method: 'GET',
                headers: isDevelopment ? {} : {
                    'User-Agent': 'InmoMarket-Refactor/1.0',
                    'Accept': 'application/json',
                    'Accept-Language': 'es,en'
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.address) {
                const newAddress = {
                    municipality: data.address.city || data.address.town || data.address.village || '',
                    department: data.address.state || '',
                }
                setAddress(newAddress)
                onLocationChange({
                    latitude: latlng.lat,
                    longitude: latlng.lng,
                    ...newAddress
                })
            }
        } catch (error) {
            console.error('Error fetching address:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePositionChange = (newPosition) => {
        if (!newPosition) return
        console.log('LocationMap - Position changed:', newPosition)
        setPosition(newPosition)
        // Always fetch address when user changes position
        fetchAddress(newPosition)
    }

    // Initialize position and address on mount
    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition)
            // If we have initial address, use it; otherwise fetch from coordinates
            if (initialAddress?.municipality && initialAddress?.department) {
                // Address already provided, no need to fetch
                setAddress({
                    municipality: initialAddress.municipality,
                    department: initialAddress.department
                })
            } else {
                // Fetch address from coordinates
                fetchAddress(initialPosition)
            }
        }
    }, []) // Only run once on mount

    return (
        <div className="space-y-4">
            <div className="h-[400px] w-full rounded-lg overflow-hidden border">
                <MapContainer
                    center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        onPositionChange={handlePositionChange}
                    />
                </MapContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Latitud</label>
                    <input
                        type="number"
                        value={position?.lat || ''}
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-muted"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Longitud</label>
                    <input
                        type="number"
                        value={position?.lng || ''}
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-muted"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Municipio</label>
                    <input
                        type="text"
                        value={address.municipality}
                        onChange={(e) => {
                            const newAddress = { ...address, municipality: e.target.value }
                            setAddress(newAddress)
                            onLocationChange({
                                latitude: position?.lat,
                                longitude: position?.lng,
                                ...newAddress
                            })
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Departamento</label>
                    <input
                        type="text"
                        value={address.department}
                        onChange={(e) => {
                            const newAddress = { ...address, department: e.target.value }
                            setAddress(newAddress)
                            onLocationChange({
                                latitude: position?.lat,
                                longitude: position?.lng,
                                ...newAddress
                            })
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            </div>
            
            {isLoading && (
                <div className="text-sm text-muted-foreground">
                    Obteniendo información de la ubicación...
                </div>
            )}
        </div>
    )
} 