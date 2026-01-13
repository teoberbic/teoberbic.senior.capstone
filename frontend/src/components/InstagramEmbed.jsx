import React, { useEffect } from 'react';

const InstagramEmbed = ({ url }) => {
    useEffect(() => {
        // Use API Key if available in environment variables
        const apiKey = import.meta.env.VITE_IFRAMELY_API_KEY || '';
        const scriptSrc = `//cdn.iframe.ly/embed.js${apiKey ? `?api_key=${apiKey}` : ''}`;

        let script = document.querySelector(`script[src^="//cdn.iframe.ly/embed.js"]`);

        if (!script) {
            script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            document.body.appendChild(script);
        }

        // Always try to load iframely content when URL changes
        const load = () => {
            if (window.iframely) {
                window.iframely.load();
            }
        };

        // If script is already loaded (or was just added and loaded fast), assume iframely is available or will be soon
        // We can attach a listener to the script if not yet loaded
        if (!script.dataset.loaded) {
            script.addEventListener('load', () => {
                script.dataset.loaded = 'true';
                load();
            });
            // Also set it if it finishes
            script.onload = () => {
                script.dataset.loaded = 'true';
                load();
            };
        } else {
            load();
        }

        // Polling fallback just in case script execution allows window.iframely to appear slightly later
        const interval = setInterval(() => {
            if (window.iframely) {
                window.iframely.load();
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);

    }, [url]);

    return (
        <div className="iframely-embed">
            {/* Removed fixed height to allow content to expand */}
            <div className="iframely-responsive">
                <a href={url} data-iframely-url></a>
            </div>
        </div>
    );
};

export default InstagramEmbed;
