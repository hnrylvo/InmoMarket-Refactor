import React, { useState } from 'react'
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PriceInput from '@/components/shared/PriceInput'
import LocationMap from '@/components/shared/LocationMap'
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'

const daysOfWeek = [
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
    { value: '7', label: 'Domingo' }
]

const steps = [
    {
        id: 'general',
        title: 'Información General',
        fields: [
            { id: 'title', label: 'Título del Aviso', type: 'text', required: true },
            { id: 'tipo', label: 'Tipo de Propiedad', type: 'text', required: true },
            { id: 'propertyDescription', label: 'Descripción', type: 'textarea', required: true },
            { 
                id: 'propertyDetails',
                type: 'group',
                fields: [
                    { id: 'propertySize', label: 'Tamaño (m²)', type: 'number', required: true, min: 0, allowDecimals: true },
                    { id: 'propertyBedrooms', label: 'Dormitorios', type: 'number', required: true, min: 0, allowDecimals: false },
                    { id: 'propertyFloors', label: 'Plantas', type: 'number', required: true, min: 0, allowDecimals: false },
                    { id: 'propertyParking', label: 'Estacionamientos', type: 'number', required: true, min: 0, allowDecimals: false },
                ]
            },
            { id: 'propertyFurnished', label: 'Amueblado', type: 'checkbox', required: false },
        ]
    },
    {
        id: 'location',
        title: 'Ubicación',
        fields: [
            { id: 'propertyAddress', label: 'Dirección', type: 'text', required: true },
            { id: 'neighborhood', label: 'Barrio', type: 'text', required: true },
            { 
                id: 'locationMap',
                type: 'map',
                required: true
            },
        ]
    },
    {
        id: 'price',
        title: 'Precio y Disponibilidad',
        fields: [
            { id: 'propertyPrice', label: 'Precio', type: 'price', required: true },
            { id: 'availableTimes', label: 'Horarios Disponibles', type: 'timeSlots', required: true },
        ]
    },
    {
        id: 'images',
        title: 'Imágenes',
        fields: [
            { id: 'files', label: 'Imágenes de la Propiedad', type: 'file', required: true },
        ]
    },
    {
        id: 'review',
        title: 'Revisar Información',
        fields: []
    }
]

const convertToWebP = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0)
                
                canvas.toBlob((blob) => {
                    const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                        type: 'image/webp'
                    })
                    resolve(webpFile)
                }, 'image/webp', 0.8)
            }
            img.onerror = reject
            img.src = e.target.result
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export default function CreatePublication() {
    const navigate = useNavigate()
    const { token } = useAuthStore()
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({})
    const [timeSlots, setTimeSlots] = useState([])
    const [previewImages, setPreviewImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})

    const getDayName = (dayNumber) => {
        return daysOfWeek.find(day => day.value === dayNumber)?.label || dayNumber
    }

    // Validation functions
    const validateField = (fieldId, value, fieldConfig) => {
        // Check if required field is empty
        if (fieldConfig.required && (!value || value === '' || value === null || value === undefined)) {
            return `${fieldConfig.label} es obligatorio`
        }

        // For non-empty values, perform additional validation
        if (value !== '' && value !== null && value !== undefined) {
            // Text validation
            if (fieldConfig.type === 'text' || fieldConfig.type === 'textarea') {
                if (typeof value === 'string' && value.trim().length === 0) {
                    return `${fieldConfig.label} no puede estar vacío`
                }
                if (typeof value === 'string' && value.trim().length < 3) {
                    return `${fieldConfig.label} debe tener al menos 3 caracteres`
                }
            }

            // Number validation
            if (fieldConfig.type === 'number') {
                const numValue = parseFloat(value)
                if (isNaN(numValue)) {
                    return `${fieldConfig.label} debe ser un número válido`
                }
                if (numValue < fieldConfig.min) {
                    return `${fieldConfig.label} debe ser mayor o igual a ${fieldConfig.min}`
                }
                if (numValue < 0) {
                    return `${fieldConfig.label} no puede ser negativo`
                }
                if (!fieldConfig.allowDecimals && !Number.isInteger(numValue)) {
                    return `${fieldConfig.label} debe ser un número entero`
                }
            }

            // Price validation
            if (fieldConfig.type === 'price') {
                const numValue = parseFloat(value.replace(/\D/g, ''))
                if (isNaN(numValue) || numValue <= 0) {
                    return `${fieldConfig.label} debe ser un valor válido mayor a 0`
                }
            }
        }

        return null
    }

    const validateStep = (stepIndex) => {
        const step = steps[stepIndex]
        const newErrors = {}

        step.fields.forEach(field => {
            if (field.type === 'group') {
                field.fields.forEach(subField => {
                    const error = validateField(subField.id, formData[subField.id], subField)
                    if (error) {
                        newErrors[subField.id] = error
                    }
                })
            } else if (field.type === 'timeSlots') {
                if (timeSlots.length === 0) {
                    newErrors.availableTimes = 'Debe agregar al menos un horario disponible'
                }
            } else if (field.type === 'file') {
                if (!formData.files || formData.files.length === 0) {
                    newErrors.files = 'Debe seleccionar al menos una imagen'
                }
            } else if (field.type === 'map') {
                if (!formData.latitude || !formData.longitude) {
                    newErrors.locationMap = 'Debe seleccionar una ubicación en el mapa'
                }
            } else {
                const error = validateField(field.id, formData[field.id], field)
                if (error) {
                    newErrors[field.id] = error
                }
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (fieldId, value) => {
        // Clear error for this field when user starts typing
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldId]
                return newErrors
            })
        }

        // Convert values to appropriate types
        let processedValue = value
        switch (fieldId) {
            case 'propertySize':
                // Allow decimals for size, but remove negative signs
                processedValue = value === '' ? '' : value.replace(/^-/, '')
                if (processedValue !== '') {
                    processedValue = parseFloat(processedValue) || 0
                }
                break
            case 'propertyBedrooms':
            case 'propertyFloors':
            case 'propertyParking':
                // Only integers for these fields, remove negative signs
                processedValue = value === '' ? '' : value.replace(/^-/, '')
                if (processedValue !== '') {
                    processedValue = parseInt(processedValue) || 0
                }
                break
            case 'propertyFurnished':
                processedValue = Boolean(value)
                break
            case 'propertyPrice':
                processedValue = value.replace(/\D/g, '') // Keep only digits
                break
        }

        setFormData(prev => ({
            ...prev,
            [fieldId]: processedValue
        }))
    }

    // Prevent negative signs from being typed
    const handleKeyDown = (e, fieldId) => {
        // Prevent minus sign (-) from being typed
        if (e.key === '-') {
            e.preventDefault()
            return
        }
        
        // For number fields, only allow numbers, backspace, delete, arrow keys, etc.
        if (['propertySize', 'propertyBedrooms', 'propertyFloors', 'propertyParking'].includes(fieldId)) {
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Tab', 'Enter', 'Home', 'End', 'PageUp', 'PageDown'
            ]
            
            // Allow decimal point only for propertySize
            if (fieldId === 'propertySize' && e.key === '.') {
                return
            }
            
            // Allow only numbers and allowed keys
            if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                e.preventDefault()
            }
        }
    }

    const handleTimeSlotAdd = (dayOfWeek, startTime, endTime) => {
        // Validate that all required fields are filled
        if (!dayOfWeek || !startTime || !endTime) {
            toast.error('Por favor complete todos los campos del horario')
            return
        }

        // Validate that end time is after start time
        if (startTime >= endTime) {
            toast.error('La hora de fin debe ser posterior a la hora de inicio')
            return
        }

        // Ensure time format is HH:mm:ss
        const formatTime = (time) => {
            if (!time) return '00:00:00'
            return time.length === 5 ? `${time}:00` : time
        }

        setTimeSlots(prev => [...prev, {
            dayOfWeek: parseInt(dayOfWeek),
            startTime: formatTime(startTime),
            endTime: formatTime(endTime)
        }])

        // Clear the form fields after adding
        setFormData(prev => ({
            ...prev,
            dayOfWeek: '',
            startTime: '',
            endTime: ''
        }))
    }

    const handleTimeSlotRemove = (index) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index))
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        
        try {
            // Convert all images to WebP
            const webpFiles = await Promise.all(
                files.map(async (file) => {
                    if (file.type === 'image/webp') {
                        return file
                    }
                    return await convertToWebP(file)
                })
            )

            setFormData(prev => ({
                ...prev,
                files: webpFiles
            }))

            // Create preview URLs
            const previews = webpFiles.map(file => URL.createObjectURL(file))
            setPreviewImages(previews)
        } catch (error) {
            console.error('Error converting images:', error)
            toast.error('Error al procesar las imágenes')
        }
    }

    const handlePriceChange = (price) => {
        // Store the raw price value (digits only)
        handleInputChange('propertyPrice', price)
    }

    const formatPrice = (price) => {
        if (!price) return '0.00'
        const padded = price.padStart(3, '0')
        const dollars = padded.slice(0, -2)
        const cents = padded.slice(-2)
        return `${parseInt(dollars, 10).toLocaleString()}.${cents}`
    }

    const formatPriceForAPI = (price) => {
        if (!price) return '0.00'
        const padded = price.padStart(3, '0')
        const dollars = padded.slice(0, -2)
        const cents = padded.slice(-2)
        return `${parseInt(dollars, 10)}.${cents}`
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            const isValid = validateStep(currentStep)
            if (isValid) {
                setCurrentStep(prev => prev + 1)
            } else {
                toast.error('Por favor, complete todos los campos requeridos correctamente')
            }
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validate all steps before submission
        let allValid = true
        for (let i = 0; i < steps.length - 1; i++) {
            const stepValid = validateStep(i)
            if (!stepValid) {
                allValid = false
                setCurrentStep(i)
                toast.error(`Por favor complete correctamente el paso: ${steps[i].title}`)
                break
            }
        }

        if (!allValid) {
            return
        }

        setIsSubmitting(true)

        try {
            if (!token) {
                console.error('No token found in auth store')
                toast.error('Error: No se encontró el token de autenticación')
                return
            }

            const formDataToSend = new FormData()

            // Add basic property information
            formDataToSend.append('propertyAddress', formData.propertyAddress || '')
            formDataToSend.append('propertyTitle', formData.title || '')
            formDataToSend.append('typeName', formData.tipo || '')
            formDataToSend.append('neighborhood', formData.neighborhood || '')
            formDataToSend.append('municipality', formData.municipality || '')
            formDataToSend.append('department', formData.department || '')
            formDataToSend.append('longitude', formData.longitude || '')
            formDataToSend.append('latitude', formData.latitude || '')
            formDataToSend.append('propertySize', formData.propertySize?.toString() || '')
            formDataToSend.append('propertyBedrooms', formData.propertyBedrooms?.toString() || '')
            formDataToSend.append('propertyFloors', formData.propertyFloors?.toString() || '')
            formDataToSend.append('propertyParking', formData.propertyParking?.toString() || '')
            formDataToSend.append('propertyFurnished', formData.propertyFurnished ? 'true' : 'false')
            formDataToSend.append('PropertyDescription', formData.propertyDescription || '')
            formDataToSend.append('PropertyPrice', formatPriceForAPI(formData.propertyPrice || ''))

            // Add available times
            timeSlots.forEach((slot, index) => {
                formDataToSend.append(`availableTimes[${index}].dayOfWeek`, slot.dayOfWeek?.toString() || '')
                formDataToSend.append(`availableTimes[${index}].startTime`, slot.startTime || '')
                formDataToSend.append(`availableTimes[${index}].endTime`, slot.endTime || '')
            })

            // Add files if they exist
            if (formData.files) {
                for (const file of formData.files) {
                    formDataToSend.append('files', file)
                }
            }

            console.log('Sending form data:', {
                propertyAddress: formData.propertyAddress,
                propertyTitle: formData.title,
                typeName: formData.tipo,
                neighborhood: formData.neighborhood,
                municipality: formData.municipality,
                department: formData.department,
                longitude: formData.longitude,
                latitude: formData.latitude,
                propertySize: formData.propertySize,
                propertyBedrooms: formData.propertyBedrooms,
                propertyFloors: formData.propertyFloors,
                propertyParking: formData.propertyParking,
                propertyFurnished: formData.propertyFurnished ? 'true' : 'false',
                PropertyDescription: formData.propertyDescription,
                PropertyPrice: formatPriceForAPI(formData.propertyPrice || ''),
                availableTimes: timeSlots,
                files: formData.files ? formData.files.length : 0
            })

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/create`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            console.log('API Success Response:', response.data)
            toast.success('Publicación creada exitosamente')
            navigate('/publications')
        } catch (error) {
            console.error('Error completo:', error)
            if (error.response) {
                console.error('API Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers,
                    data: error.response.data
                })
            }
            console.error('Form Data:', {
                ...formData,
                files: formData.files ? formData.files.length : 0,
                timeSlots
            })
            toast.error('Error al crear la publicación')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderField = (field) => {
        const fieldError = errors[field.id]
        
        switch (field.type) {
            case 'group':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field.fields.map((subField) => {
                            const subFieldError = errors[subField.id]
                            return (
                                <div key={subField.id} className="space-y-2">
                                    <Label htmlFor={subField.id}>{subField.label}</Label>
                                    <Input
                                        id={subField.id}
                                        type="number"
                                        min={subField.min || 0}
                                        step={subField.allowDecimals ? "0.01" : "1"}
                                        placeholder={`Ingrese ${subField.label.toLowerCase()}`}
                                        value={formData[subField.id] || ''}
                                        onChange={(e) => handleInputChange(subField.id, e.target.value)}
                                        required={subField.required}
                                        className={subFieldError ? "border-red-500" : ""}
                                        onKeyDown={(e) => handleKeyDown(e, subField.id)}
                                    />
                                    {subFieldError && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {subFieldError}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
            case 'textarea':
                return (
                    <div className="space-y-2">
                        <Textarea
                            id={field.id}
                            placeholder={`Ingrese ${field.label.toLowerCase()}`}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={`min-h-[150px] resize-none ${fieldError ? "border-red-500" : ""}`}
                            required={field.required}
                            onKeyDown={(e) => handleKeyDown(e, field.id)}
                        />
                        {fieldError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {fieldError}
                            </div>
                        )}
                    </div>
                )
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={field.id}
                            checked={Boolean(formData[field.id])}
                            onCheckedChange={(checked) => handleInputChange(field.id, checked)}
                            required={field.required}
                        />
                        <label
                            htmlFor={field.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {field.label}
                        </label>
                    </div>
                )
            case 'price':
                return (
                    <div className="space-y-2">
                        <PriceInput 
                            value={formData.propertyPrice || ''}
                            onChange={handlePriceChange}
                            required={field.required}
                        />
                        {fieldError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {fieldError}
                            </div>
                        )}
                    </div>
                )
            case 'timeSlots':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Select
                                value={formData.dayOfWeek || ''}
                                onValueChange={(value) => handleInputChange('dayOfWeek', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un día" />
                                </SelectTrigger>
                                <SelectContent>
                                    {daysOfWeek.map((day) => (
                                        <SelectItem key={day.value} value={day.value}>
                                            {day.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="time"
                                value={formData.startTime || ''}
                                onChange={(e) => handleInputChange('startTime', e.target.value)}
                            />
                            <Input
                                type="time"
                                value={formData.endTime || ''}
                                onChange={(e) => handleInputChange('endTime', e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={() => handleTimeSlotAdd(
                                formData.dayOfWeek,
                                formData.startTime,
                                formData.endTime
                            )}
                            className="w-full sm:w-auto"
                            disabled={!formData.dayOfWeek || !formData.startTime || !formData.endTime}
                        >
                            Agregar Horario
                        </Button>
                        <div className="space-y-2">
                            {timeSlots.map((slot, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-muted rounded gap-2">
                                    <span className="text-sm">
                                        {getDayName(slot.dayOfWeek)} {slot.startTime} - {slot.endTime}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleTimeSlotRemove(index)}
                                        className="w-full sm:w-auto"
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {errors.availableTimes && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {errors.availableTimes}
                            </div>
                        )}
                    </div>
                )
            case 'file':
                return (
                    <div className="space-y-4">
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            required={field.required}
                            className={fieldError ? "border-red-500" : ""}
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {previewImages.map((url, index) => (
                                <div key={index} className="aspect-square relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                        {fieldError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {fieldError}
                            </div>
                        )}
                    </div>
                )
            case 'map':
                return (
                    <div className="space-y-2">
                        <LocationMap
                            onLocationChange={(locationData) => {
                                handleInputChange('latitude', locationData.latitude)
                                handleInputChange('longitude', locationData.longitude)
                                handleInputChange('municipality', locationData.municipality)
                                handleInputChange('department', locationData.department)
                            }}
                        />
                        {fieldError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {fieldError}
                            </div>
                        )}
                    </div>
                )
            default:
                return (
                    <div className="space-y-2">
                        <Input
                            id={field.id}
                            type={field.type}
                            placeholder={`Ingrese ${field.label.toLowerCase()}`}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                            className={fieldError ? "border-red-500" : ""}
                            onKeyDown={(e) => handleKeyDown(e, field.id)}
                        />
                        {fieldError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {fieldError}
                            </div>
                        )}
                    </div>
                )
        }
    }

    const isAllStepsValid = () => {
        for (let i = 0; i < steps.length - 1; i++) {
            const step = steps[i]
            let stepValid = true

            step.fields.forEach(field => {
                if (field.type === 'group') {
                    field.fields.forEach(subField => {
                        if (subField.required && (!formData[subField.id] || formData[subField.id] === '')) {
                            stepValid = false
                        }
                    })
                } else if (field.type === 'timeSlots') {
                    if (timeSlots.length === 0) {
                        stepValid = false
                    }
                } else if (field.type === 'file') {
                    if (!formData.files || formData.files.length === 0) {
                        stepValid = false
                    }
                } else if (field.type === 'map') {
                    if (!formData.latitude || !formData.longitude) {
                        stepValid = false
                    }
                } else if (field.required && (!formData[field.id] || formData[field.id] === '')) {
                    stepValid = false
                }
            })

            if (!stepValid) return false
        }
        return true
    }

    const renderReviewStep = () => {
        const canSubmit = isAllStepsValid()
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Información General</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">Título:</span> {formData.title}</p>
                            <p><span className="font-medium">Tipo:</span> {formData.tipo}</p>
                            <p><span className="font-medium">Descripción:</span> {formData.propertyDescription}</p>
                            <p><span className="font-medium">Tamaño:</span> {formData.propertySize} m²</p>
                            <p><span className="font-medium">Dormitorios:</span> {formData.propertyBedrooms}</p>
                            <p><span className="font-medium">Plantas:</span> {formData.propertyFloors}</p>
                            <p><span className="font-medium">Estacionamientos:</span> {formData.propertyParking}</p>
                            <p><span className="font-medium">Amueblado:</span> {formData.propertyFurnished ? 'Sí' : 'No'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Ubicación</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">Dirección:</span> {formData.propertyAddress}</p>
                            <p><span className="font-medium">Barrio:</span> {formData.neighborhood}</p>
                            <p><span className="font-medium">Municipio:</span> {formData.municipality}</p>
                            <p><span className="font-medium">Departamento:</span> {formData.department}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Precio y Disponibilidad</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">Precio:</span> ${formatPrice(formData.propertyPrice)}</p>
                            <div>
                                <p className="font-medium">Horarios Disponibles:</p>
                                <ul className="list-disc list-inside">
                                    {timeSlots.map((slot, index) => (
                                        <li key={index}>
                                            {getDayName(slot.dayOfWeek)}: {slot.startTime} - {slot.endTime}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Imágenes</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {previewImages.map((url, index) => (
                                <div key={index} className="aspect-square relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {!canSubmit && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-md">
                        <AlertCircle className="w-4 h-4" />
                        <span>Por favor complete todos los pasos anteriores antes de crear la publicación</span>
                    </div>
                )}

                <div className="flex justify-between gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        className="w-full sm:w-auto"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Editar Información
                    </Button>
                    
                    <Button 
                        type="submit" 
                        className="w-full sm:w-auto"
                        disabled={isSubmitting || !canSubmit}
                    >
                        {isSubmitting ? 'Creando...' : 'Confirmar y Crear Publicación'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
            <div className="container mx-auto py-8 px-4">
                <PageHeader
                    title="Crear Nuevo Aviso"
                    description="Complete el formulario paso a paso para crear un nuevo aviso de propiedad."
                />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-8 px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center w-full sm:w-auto">
                                    <div className={`
                                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                                        ${index === currentStep ? 'bg-primary text-primary-foreground' : 
                                          index < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted'}
                                    `}>
                                        {index < currentStep ? <Check className="w-4 h-4 sm:w-6 sm:h-6" /> : index + 1}
                                    </div>
                                    <span className="text-xs sm:text-sm mt-2 text-center">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`
                                        hidden sm:block flex-1 h-1 mx-4
                                        ${index < currentStep ? 'bg-primary' : 'bg-muted'}
                                    `} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <Card className="mx-4 sm:mx-0">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">
                            {steps[currentStep].title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {currentStep === steps.length - 1 ? (
                                renderReviewStep()
                            ) : (
                                <>
                                    {steps[currentStep].fields.map(field => (
                                        <div key={field.id} className="space-y-2">
                                            {field.type !== 'checkbox' && <Label htmlFor={field.id}>{field.label}</Label>}
                                            {renderField(field)}
                                        </div>
                                    ))}

                                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handlePrevious}
                                            disabled={currentStep === 0}
                                            className="w-full sm:w-auto"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-2" />
                                            Anterior
                                        </Button>
                                        
                                        <Button 
                                            type="button" 
                                            onClick={handleNext} 
                                            className="w-full sm:w-auto"
                                        >
                                            Siguiente
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}