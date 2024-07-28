'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { axiosInstance } from '../../_lib/axios';
import * as Yup from 'yup';

import Swal from 'sweetalert2';

export default function AddEmailComponent() {
  const signUpSchema = Yup.object({
    email: Yup.string().required('Email is required'),
  });
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        await axiosInstance().post('/v1/check-email-reset-pass', values);
        Swal.fire({
          title: 'Success',
          text: 'Please check your email for verification, reset password',
          icon: 'success',
        });
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error',
          text: 'There was an error, please check your input email again.',
          icon: 'error',
        });
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div>
            {formik.touched.email && formik.errors.email ? (
              <div className="bg-[#D9534F] text-white text-[10px] pl-1">
                {formik.errors.email}
              </div>
            ) : null}
            <Input
              type="email"
              id="email"
              placeholder="Your Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
          </div>
          <button
            className="bg-green-500 p-2 rounded-[8px] text-white"
            type="submit"
          >
            Send Email
          </button>
        </div>
      </form>
    </>
  );
}
