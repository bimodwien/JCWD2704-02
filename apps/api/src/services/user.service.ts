import { hashPassword, comparePassword } from '../lib/bcrypt';
import referalCode from '../lib/referalCode';
import { Request, response } from 'express';
import axios from 'axios';
import prisma from '@/prisma';
import { google, oauth2_v2 } from 'googleapis';
import { TUser } from '@/models/user.model';
import { transporter } from '@/lib/nodemailer';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config';
import { createToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { firebase } from 'googleapis/build/src/apis/firebase';
import { auth } from '../lib/firebase';

class UserService {
  async addEmail(req: Request) {
    const { email, referralCode } = req.body;
    const userExists = await prisma.user.findMany({
      where: {
        OR: [{ email }],
      },
    });

    if (userExists.length) throw new Error('Email has been used');

    const finalReferralCode = referralCode || referalCode.generate();

    const createUser = await prisma.user.create({
      data: {
        email,
        referralCode: finalReferralCode,
      },
    });

    if (!createUser) throw new Error('Fail add email');

    const token = createToken({ id: createUser.id }, '1h');
    const a = await transporter.sendMail({
      to: email,
      subject: 'Register to Grocery Web',
      text: 'verify your account',
      html: `<a href="http://localhost:8000/v1/verify/${token}">Verify your account</a>`, // html body
    });

    return a;
  }

  async registerVerify(req: Request) {
    const { token } = req.params;
    const newUser = verify(token, SECRET_KEY) as TUser;
    const data = await prisma.user.update({
      data: {
        isVerified: true,
      },
      where: {
        id: newUser?.id,
      },
    });
    return data;
  }

  async udpateSignUp(req: Request) {
    const userId = req.params.id;
    const { name, password } = req.body;

    const hashPass = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        password: hashPass,
      },
    });
    return updatedUser;
  }

  async signIn(req: Request) {
    const { email, password } = req.body;
    // console.log(req.body);

    const data = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!data) throw new Error('wrong email');

    const checkUser = await comparePassword(String(data.password), password);
    // console.log(data);

    if (!checkUser) throw new Error('incorrect password');

    delete (data as any).password;

    const accessToken = createToken(data, '1hr');
    const refreshToken = createToken({ id: data.id }, '20 hr');

    console.log('access token: ', accessToken);
    console.log('refresh token: ', refreshToken);

    return { accessToken, refreshToken };
  }

  async Location(req: Request) {
    try {
      const userId = req.params.id;
      const { latitude, longitude } = req.body;

      if (!userId) throw new Error('need user id');

      if (latitude === undefined || longitude === undefined)
        throw new Error('latitude and longtitude required');

      const updateLocation = await prisma.user.update({
        where: { id: userId },
        data: {
          latitude: latitude,
          longitude: longitude,
        },
      });

      console.log('====================================');
      console.log(updateLocation);
      console.log('====================================');
      return updateLocation;
    } catch (error) {
      throw error;
    }
  }

  async regisWithGoogle(req: Request) {
    const { uid, email, name, referralCode, photoURL } = req.body;
    const userExists = await prisma.user.findMany({ where: { googleId: uid } });

    const finalReferralCode = referralCode || referalCode.generate();

    let profilePictureBuffer: Buffer | undefined;
    try {
      const response = await axios.get(photoURL, {
        responseType: 'arraybuffer',
      });
      profilePictureBuffer = Buffer.from(response.data, 'base64');
    } catch (error) {
      console.error('Error fetching image:', error);
    }

    if (!userExists || userExists.length === 0) {
      const userData = await prisma.user.create({
        data: {
          email,
          googleId: uid,
          name,
          isVerified: true,
          referralCode: finalReferralCode,
          profilePicture: profilePictureBuffer,
        },
      });
      return userData;
    }
  }

  async loginWithGoogle(req: Request) {
    const { email } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = createToken({ id: user.id });
    const refreshToken = createToken({ id: user.id }, '20hr');

    return { accessToken, refreshToken };
  }

  async referralCode(req: Request) {
    const userID = req.params.id;
    const { referredCode } = req.body;

    if (!userID) throw new Error('Used Id Not Requirred');
    if (!referredCode) throw new Error('Referred Code Required');

    const referredUser = await prisma.user.findFirst({
      where: {
        referralCode: referredCode,
      },
    });

    if (!referredUser) throw new Error('Invalid Refferal Code');

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { referredCode },
    });

    return updatedUser;
  }
}
export default new UserService();
