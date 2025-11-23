import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePublicationsStore } from '../stores/usePublicationsStore';
import { useAuthStore } from '../stores/useAuthStore';
import PropertyClientView from '../pages/publications/PropertyClientView';

export function PropertyRoute() {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const { publications, loading, fetchPublications, fetchPublicationById } = usePublicationsStore();
    const { token } = useAuthStore();
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    useEffect(() => {
        const loadPublication = async () => {
            // Check if publication is already in store
            let publication = publications.find(pub => pub.id === id);
            
            // If not in store, fetch it
            if (!publication) {
                if (token) {
                    try {
                        // Always try to fetch the publication individually to ensure we have the latest data
                        // This is especially important after updates
                        await fetchPublicationById(id, token);
                    } catch (error) {
                        console.error('Error fetching publication:', error);
                        // If individual fetch fails, try to get from store or fetch all
                        if (publications.length === 0) {
                            await fetchPublications(token);
                        }
                    }
                } else if (publications.length === 0) {
                    // If no token, try to fetch all publications
                    await fetchPublications(token);
                }
            }

            // Only redirect if we've attempted to load and still no publication
            if (hasAttemptedLoad && !loading) {
                const finalPublication = publications.find(pub => pub.id === id);
                if (!finalPublication) {
                    console.error('Publication not found in store');
                    navigate('/publications');
                }
            }

            if (!hasAttemptedLoad) {
                setHasAttemptedLoad(true);
            }
        };

        if (id) {
            loadPublication();
        }
    }, [id, token, navigate, fetchPublications, fetchPublicationById]);

    return <PropertyClientView />;
} 