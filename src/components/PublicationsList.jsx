import { useEffect } from 'react';
import { usePublicationsStore } from '../stores/usePublicationsStore';
import { useAuthStore } from '../stores/useAuthStore';
import { ExpandedPropertyCard } from './Home/ExpandedPropertyCard';
import { Skeleton } from './ui/skeleton';

export function PublicationsList() {
    const { publications, loading, error, fetchPublications } = usePublicationsStore();
    const { token } = useAuthStore();

    useEffect(() => {
        if (token) {
            fetchPublications(token);
        }
    }, [token, fetchPublications]);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="space-y-4">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((publication) => (
                <ExpandedPropertyCard
                    key={publication.id}
                    {...publication}
                />
            ))}
        </div>
    );
} 