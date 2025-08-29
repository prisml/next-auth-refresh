import React from 'react';
export const dynamic = 'force-dynamic';
import { ProtectedPageClient } from './protectedClient';

export default function ProtectedPage() {
    return <ProtectedPageClient />;
}
