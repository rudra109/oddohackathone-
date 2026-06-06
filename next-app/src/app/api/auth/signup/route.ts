import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'procurement_officer', 'manager', 'vendor'])
});

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = signupSchema.parse(body);
    const existing = await User.findOne({ email: data.email }).lean();
    
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role
    });

    return NextResponse.json({ message: 'User created successfully', userId: user._id.toString() }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
