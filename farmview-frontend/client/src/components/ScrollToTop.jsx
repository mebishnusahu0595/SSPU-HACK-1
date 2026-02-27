import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Immediate scroll
        window.scrollTo(0, 0);

        // Timeout backup for slow-rendering pages or some mobile browsers
        const timeoutId = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
}
