import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePublicationsStore } from '../stores/usePublicationsStore';
import { useAuthStore } from '../stores/useAuthStore';
import PropertyClientView from '../pages/publications/PropertyClientView';

export function PropertyRoute() {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const { publications, loading, fetchPublications } = usePublicationsStore();
    const { token } = useAuthStore();
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    useEffect(() => {
        const loadPublication = async () => {
            // If we don't have publications, fetch them (with or without token)
            if (publications.length === 0) {
                await fetchPublications(token);
            }

            // Find the publication by ID
            const publication = publications.find(pub => pub.id === id);

            // Only redirect if we've attempted to load and the publication is not found
            if (hasAttemptedLoad && !loading && !publication) {
                console.error('Publication not found in store');
                navigate('/publications');
            }

            setHasAttemptedLoad(true);
        };

        loadPublication();
    }, [id, token, publications, loading, navigate, fetchPublications, hasAttemptedLoad]);

    return <PropertyClientView />;
} 