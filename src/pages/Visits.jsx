import React, { useEffect, useState } from 'react'
import { PageHeader } from "@/components/ui/page-header"
import { useAuthStore } from '@/stores/useAuthStore'
import { visitService } from '@/services/visitService'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import VisitDetailsDialog from '@/components/VisitDetailsDialog'
import MyVisitDialog from '@/components/MyVisitDialog'

export default function Visits() {
    const { token } = useAuthStore();
    // My requested visits
    const [myVisits, setMyVisits] = useState([])
    const [myVisitsPage, setMyVisitsPage] = useState(0)
    const [myVisitsTotalPages, setMyVisitsTotalPages] = useState(1)
    const [myVisitsLoading, setMyVisitsLoading] = useState(false)
    // Visits requested to me
    const [propertyVisits, setPropertyVisits] = useState([])
    const [propertyVisitsPage, setPropertyVisitsPage] = useState(0)
    const [propertyVisitsTotalPages, setPropertyVisitsTotalPages] = useState(1)
    const [propertyVisitsLoading, setPropertyVisitsLoading] = useState(false)

    // Fetch my requested visits
    useEffect(() => {
        if (!token) return;
        setMyVisitsLoading(true)
        visitService.getUserVisits(token, myVisitsPage, 6)
            .then(data => {
                setMyVisits(data.content || [])
                setMyVisitsTotalPages(data.totalPages || 1)
            })
            .finally(() => setMyVisitsLoading(false))
    }, [token, myVisitsPage])

    // Fetch visits requested to me
    useEffect(() => {
        if (!token) return;
        setPropertyVisitsLoading(true)
        visitService.getPropertyVisits(token, propertyVisitsPage, 6)
            .then(data => {
                setPropertyVisits(data.content || [])
                setPropertyVisitsTotalPages(data.totalPages || 1)
            })
            .finally(() => setPropertyVisitsLoading(false))
    }, [token, propertyVisitsPage])

    // Utilidad para estado en español y color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
            case 'ACCEPTED':
                return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Aceptada</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive">Rechazada</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">Cancelada</Badge>;
            case 'COMPLETED':
                return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Completada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen pt-[--header-height]">
            <div className="container mx-auto py-8 px-4">
                <PageHeader title="Visitas" description="Encuentra tus peticiones y respuestas de visitas." />

                {/* Mis visitas solicitadas */}
                <Collapsible className="mb-6">
                    <CollapsibleTrigger>Visitas que he solicitado</CollapsibleTrigger>
                    <CollapsibleContent>
                        {myVisitsLoading ? (
                            <div className="py-8 text-center">Cargando...</div>
                        ) : myVisits.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">No has solicitado visitas.</div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                {myVisits.map(visit => (
                                    <MyVisitDialog key={visit.id} visit={visit}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                            <CardHeader>
                                                <CardTitle className="text-base">{visit.publicationTitle}</CardTitle>
                                                <div className="text-xs text-gray-500">{visit.publicationAddress}</div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm mb-2">Fecha: <span className="font-medium">{visit.visitDate}</span></div>
                                                <div className="text-sm mb-2">Hora: <span className="font-medium">{visit.visitTime}</span></div>
                                                <div className="text-sm mb-2">Estado: {getStatusBadge(visit.status)}</div>
                                                <div className="text-xs text-gray-500">Mensaje: {visit.userMessage || 'Sin mensaje'}</div>
                                            </CardContent>
                                        </Card>
                                    </MyVisitDialog>
                                ))}
                            </div>
                        )}
                        {myVisitsTotalPages > 1 && (
                            <div className="mt-6 flex justify-center items-center gap-2">
                                <Button variant="outline" onClick={() => setMyVisitsPage(p => Math.max(0, p - 1))} disabled={myVisitsPage === 0}>Anterior</Button>
                                <span className="px-4">Página {myVisitsPage + 1} de {myVisitsTotalPages}</span>
                                <Button variant="outline" onClick={() => setMyVisitsPage(p => Math.min(myVisitsTotalPages - 1, p + 1))} disabled={myVisitsPage === myVisitsTotalPages - 1}>Siguiente</Button>
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>

                {/* Visitas que me han solicitado */}
                <Collapsible>
                    <CollapsibleTrigger>Visitas que me han solicitado</CollapsibleTrigger>
                    <CollapsibleContent>
                        {propertyVisitsLoading ? (
                            <div className="py-8 text-center">Cargando...</div>
                        ) : propertyVisits.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">No tienes solicitudes de visitas.</div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                {propertyVisits.map(visit => (
                                    <VisitDetailsDialog key={visit.id} visit={visit} onRespond={() => setPropertyVisitsPage(0)}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                            <CardHeader>
                                                <CardTitle className="text-base">{visit.publicationTitle}</CardTitle>
                                                <div className="text-xs text-gray-500">{visit.publicationAddress}</div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm mb-2">Fecha: <span className="font-medium">{visit.visitDate}</span></div>
                                                <div className="text-sm mb-2">Hora: <span className="font-medium">{visit.visitTime}</span></div>
                                                <div className="text-sm mb-2">Solicitante: <span className="font-medium">{visit.visitorName}</span></div>
                                                <div className="text-sm mb-2">Estado: {getStatusBadge(visit.status)}</div>
                                                <div className="text-xs text-gray-500">Mensaje: {visit.userMessage || 'Sin mensaje'}</div>
                                            </CardContent>
                                        </Card>
                                    </VisitDetailsDialog>
                                ))}
                            </div>
                        )}
                        {propertyVisitsTotalPages > 1 && (
                            <div className="mt-6 flex justify-center items-center gap-2">
                                <Button variant="outline" onClick={() => setPropertyVisitsPage(p => Math.max(0, p - 1))} disabled={propertyVisitsPage === 0}>Anterior</Button>
                                <span className="px-4">Página {propertyVisitsPage + 1} de {propertyVisitsTotalPages}</span>
                                <Button variant="outline" onClick={() => setPropertyVisitsPage(p => Math.min(propertyVisitsTotalPages - 1, p + 1))} disabled={propertyVisitsPage === propertyVisitsTotalPages - 1}>Siguiente</Button>
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    )
}