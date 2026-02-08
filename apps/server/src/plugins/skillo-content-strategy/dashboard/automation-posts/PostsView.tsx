import React from 'react';
import { Send, Image, Video, FileText } from 'lucide-react';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Image, endpoints: ['POST /publish/instagram/image', 'POST /publish/instagram/reel'] },
    { id: 'linkedin', name: 'LinkedIn', icon: FileText, endpoints: ['POST /publish/linkedin'] },
    { id: 'youtube', name: 'YouTube', icon: Video, endpoints: ['POST /publish/youtube'] },
];

export function PostsView() {
    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-2">Posts</h1>
            <p className="text-muted-foreground text-sm mb-6">
                Publish content to connected accounts. Use the API endpoints below or integrate with the Content Calendar.
            </p>
            <div className="space-y-4">
                {PLATFORMS.map(({ id, name, icon: Icon, endpoints }) => (
                    <div
                        key={id}
                        className="rounded-lg border border-border bg-card p-4"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {name}
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            {endpoints.map((ep) => (
                                <li key={ep}>
                                    <code className="bg-muted px-1.5 py-0.5 rounded">{ep}</code>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <p className="text-muted-foreground text-xs mt-6 flex items-center gap-1">
                <Send className="h-3.5 w-3" />
                Connect accounts via Content Strategy → Platforms, then use the publish API with optional <code className="bg-muted px-1 rounded">?userId=</code>.
            </p>
        </div>
    );
}
