import prisma from '@/prisma';
import { Request } from 'express';
import { createToken } from '@/lib/jwt';
import { transporter } from '@/lib/nodemailer';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config';
import { TUser } from '@/models/user.model';
import { hashPassword } from '@/lib/bcrypt';

class UserService2 {
  async checkEmail(req: Request) {
    const { email } = req.body;

    const checkEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!checkEmail) {
      throw new Error('Email not found');
    }

    if (checkEmail.googleId) {
      throw new Error('Password reset is not allowed for users with Google ID');
    }

    const token = createToken({ id: checkEmail.id }, '1h');
    const a = await transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      text: 'Reset Password',
      html: `<a href="http://localhost:8000/v1/verif-token-reset-pass/${token}">Reset your password</a>`,
    });

    return a;
  }

  async resetPasswordVerify(req: Request) {
    const { token } = req.params;
    const userReset = verify(token, SECRET_KEY) as TUser;

    const decoded = userReset;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updatePassword(req: Request) {
    const { id } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword)
      throw new Error('Password or Confirm password required');

    if (password !== confirmPassword) throw new Error('Password do not match');

    const hashedPassword = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword },
    });

    return updatedUser;
  }
}

export default new UserService2();
