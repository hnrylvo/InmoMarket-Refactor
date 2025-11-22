"use client"

import {useState, useEffect, useRef} from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

const slides = [
	{
		image: "/images/hero1.jpg",
		title: "Encuentra tu hogar ideal",
		subtitle: "Explora las mejores propiedades a tu alcance.",
		button: {
			text: "Ver Propiedades",
			link: "/publications",
		},
	},
	{
		image: "/images/hero2.jpg",
		title: "Vende tu propiedad fácilmente",
		subtitle: "Publica tu anuncio y llega a miles de compradores.",
		button: {
			text: "Publicar Anuncio",
			link: "/my-publications/create",
		},
	},
	{
		image: "/images/hero3.jpg",
		title: "Confianza y seguridad",
		subtitle: "Tu mejor aliado en el mercado inmobiliario.",
		button: {
			text: "Conoce Más",
			link: "/about",
		},
	},
]

export function HomeHero() {
	const [currentSlide, setCurrentSlide] = useState(0)
	const timeoutRef = useRef(null)

	const clearAndSetTimeout = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		timeoutRef.current = setTimeout(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length)
		}, 5000)
	}

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % slides.length)
	}

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
	}

	const goToSlide = (index) => {
		setCurrentSlide(index)
	}

	useEffect(() => {
		clearAndSetTimeout()
		return () => clearTimeout(timeoutRef.current)
	}, [currentSlide])

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current)
	}, [])

	return (
		<div className="relative w-full h-[500px] overflow-hidden rounded-lg">
			{/* Slides */}
			<div
				className="flex transition-transform duration-700 ease-in-out"
				style={{ transform: `translateX(-${currentSlide * 100}%)` }}
			>
				{slides.map((slide, index) => (
					<div key={index} className="w-full flex-shrink-0 h-[500px] relative">
						<img
							src={slide.image}
							className="w-full h-full object-cover rounded-lg"
							alt={slide.title}
						/>
						<div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white p-4">
							<h1 className="text-4xl font-bold mb-2">{slide.title}</h1>
							{slide.subtitle && <p className="text-lg mb-4">{slide.subtitle}</p>}
							{slide.button && (
								<Button asChild>
									<Link to={slide.button.link}>
										{slide.button.text}
									</Link>
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Navigation Buttons */}
			<button
				onClick={prevSlide}
				className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
			>
				&#8249;
			</button>
			<button
				onClick={nextSlide}
				className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
			>
				&#8250;
			</button>

			{/* Indicators */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => goToSlide(index)}
						className={cn(
							"w-3 h-3 rounded-full",
							index === currentSlide ? "bg-white" : "bg-gray-500"
						)}
					/>
				))}
			</div>
		</div>
	)
}