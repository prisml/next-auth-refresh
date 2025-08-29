import { NextResponse } from 'next/server';
import { getUserByAccessToken } from '../_lib/session';

export async function GET(request: Request) {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    const token = auth.slice('Bearer '.length).trim();
    const user = getUserByAccessToken(token);
    if (!user) {
        return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json(user);
}
