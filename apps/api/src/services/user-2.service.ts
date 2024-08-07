import prisma from '@/prisma';
import { Request } from 'express';
import { createToken } from '@/lib/jwt';
import { transporter } from '@/lib/nodemailer';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config';
import { TUser } from '@/models/user.model';
import { hashPassword } from '@/lib/bcrypt';
import sharp from 'sharp';

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

  async updateProfile(req: Request) {
    const { id } = req.params;
    const { email, name } = req.body;
    const { file } = req;

    const userExist = await prisma.user.findFirst({
      where: { id: id },
    });

    if (!userExist) throw new Error('User not exist');
    const buffer = await sharp(req.file?.buffer).png().toBuffer();

    if (!userExist.googleId) {
      throw new Error('Cannot update profile for users with Google ID');
    }

    if (!file) throw new Error('no image uploaded');

    const data = await prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        profilePicture: buffer,
      },
    });

    return data;
  }

  async validate(req: Request) {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: { Cart: true },
    });

    if (!user) throw new Error('user not found');
    const singleCart = user.Cart.length > 0 ? user.Cart[0] : null;

    return createToken(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          Cart: singleCart,
        },
        type: 'access_token',
      },
      '1d',
    );
  }
}

export default new UserService2();
