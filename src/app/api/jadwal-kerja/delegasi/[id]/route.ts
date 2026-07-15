import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.query('DELETE FROM schedule_delegations WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Delegasi berhasil dihapus' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting delegation', error: error.message }, { status: 500 });
    }
}
