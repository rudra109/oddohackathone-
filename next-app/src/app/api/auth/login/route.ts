import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'vendorbridge-super-secret-jwt-key-2026';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = loginSchema.parse(body);
    
    const user = await User.findOne({ email: data.email }).lean();

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
