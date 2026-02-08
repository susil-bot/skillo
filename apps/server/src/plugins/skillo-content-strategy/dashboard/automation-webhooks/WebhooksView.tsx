import React from 'react';
import { Webhook, Copy, Check } from 'lucide-react';

const BASE_URL = typeof window !== 'undefined' ? `${window.location.origin.replace(/\/dashboard.*/, '')}` : '';

const ENDPOINTS = [
    { platform: 'Meta (Instagram / Facebook)', path: '/webhooks/meta', methods: 'GET (verify), POST (events)' },
    { platform: 'LinkedIn', path: '/webhooks/linkedin', methods: 'GET (challenge), POST (events)' },
    { platform: 'YouTube', path: '/webhooks/youtube', methods: 'POST (PubSubHubbub)' },
];

export function WebhooksView() {
    const [copied, setCopied] = React.useState<string | null>(null);

    const copyUrl = (path: string) => {
        const url = `${BASE_URL}${path}`;
        navigator.clipboard.writeText(url);
        setCopied(path);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-2">Webhooks</h1>
            <p className="text-muted-foreground text-sm mb-6">
                Real-time event endpoints for Meta, LinkedIn, and YouTube. Configure these URLs in each platform’s developer console.
            </p>
            <div className="space-y-4">
                {ENDPOINTS.map(({ platform, path, methods }) => {
                    const url = `${BASE_URL}${path}`;
                    const isCopied = copied === path;
                    return (
                        <div
                            key={path}
                            className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Webhook className="h-4 w-4 text-muted-foreground" />
                                {platform}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 min-w-0 truncate">
                                    {url}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => copyUrl(path)}
                                    className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded border border-input bg-background text-xs font-medium hover:bg-muted"
                                >
                                    {isCopied ? <Check className="h-3.5 w-3" /> : <Copy className="h-3.5 w-3" />}
                                    {isCopied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">{methods}</p>
                        </div>
                    );
                })}
            </div>
            <p className="text-muted-foreground text-xs mt-6">
                Set <code className="bg-muted px-1 rounded">META_WEBHOOK_VERIFY_TOKEN</code> in the server environment for Meta verification.
            </p>
        </div>
    );
}
