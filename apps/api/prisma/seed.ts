import { copyCities } from './data/cities';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

async function createSuperAdmin() {
  const email = 'superadmin@mail.com';
  const name = 'Super Admin';
  const password = 'bimobimo';

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ name }, { email }] },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const data: Prisma.UserCreateInput = {
      email,
      name,
      password: hashedPassword,
      role: 'superAdmin',
      isVerified: true,
    };

    await prisma.user.create({ data });
    console.log('SuperAdmin created');
  } else {
    console.log('SuperAdmin already exists');
  }
}

async function main() {
  await prisma.$transaction(async (prisma) => {
    try {
      await createSuperAdmin();
      const cities = await copyCities();
      await prisma.city.createMany({
        data: cities.map((city: any) => ({
          id: Number(city.city_id),
          province: city.province,
          type: city.type,
          cityName: city.city_name,
          postalCode: city.postal_code,
        })),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  });
}

main();
