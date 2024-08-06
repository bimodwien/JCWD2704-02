'use client';
import { Input } from '../../../components/ui/input';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import React from 'react';
import { axiosInstance } from '@/lib/axios';

interface Props {
  id: string; // Define id as string
}

export default function FormRedeemCode({ id }: Props) {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      referredCode: '',
    },
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance().patch(
          `/v1/refferalCode/${id}`,
          values,
        );
        Swal.fire({
          title: 'Success',
          text: 'You get the voucher, please chek your voucher after login',
          icon: 'success',
        });
        router.push(`/login`);
      } catch (error) {
        console.error('Refferal Code:', error);
        Swal.fire({
          title: 'Error',
          text: 'Wrong refferal code, please input again or check your referral code',
          icon: 'error',
        });
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid w-full items-center gap-1.5">
          <div>
            <Input
              type="referredCode"
              id="referredCode"
              placeholder="referredCode"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.referredCode}
            />
          </div>
          <button
            className="bg-green-500 p-2 rounded-[8px] text-white"
            type="submit"
          >
            Submit
          </button>
          <a href="/login">Skip</a>
        </div>
      </form>
    </>
  );
}
