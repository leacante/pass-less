'use client';

import { useState } from 'react';

interface CopyButtonProps {
    value: string;
    label: string;
    onDecrypt?: () => Promise<string>;
    variant?: 'user' | 'password';
}

export function CopyButton({ value, label, onDecrypt, variant = 'user' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCopy = async () => {
        try {
            setLoading(true);
            const textToCopy = onDecrypt ? await onDecrypt() : value;
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`copy-button ${variant} ${copied ? 'copied' : ''} ${loading ? 'loading' : ''}`}
            disabled={loading}
            title={`Copiar ${label}`}
        >
            {loading ? (
                <span className="spinner-small"></span>
            ) : copied ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
            )}
            <span className="copy-label">{label}</span>
        </button>
    );
}
