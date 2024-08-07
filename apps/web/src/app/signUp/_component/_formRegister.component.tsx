'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import RegisterIcon from '../../../../public/google.svg';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { axiosInstance } from '@/lib/axios';

interface Props {
  id: string; // Define id as string
}

export default function FormNamePassComponent({ id }: Props) {
  const signUpSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    password: Yup.string().required('Password is required'),
    //   .matches(
    //     /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,150}$/,
    //     'Password must be between 8 to 150 characters long and include at least one numeric digit.',
    //   ),
  });

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: '',
      password: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance().patch(
          `/v1/updateSignUp/${id}`,
          values,
        );
        Swal.fire({
          title: 'Success',
          text: 'Your Name and password has been registered',
          icon: 'success',
        });
        router.push(`/redeemCode/${response.data.data.id}`);
      } catch (error) {
        console.error('Error kirim email:', error);
        Swal.fire({
          title: 'Error',
          text: 'There was an error registering your name and password. Please try again.',
          icon: 'error',
        });
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <div>
            {formik.touched.name && formik.errors.name ? (
              <div className="bg-[#D9534F] text-white text-[10px] pl-1">
                {formik.errors.name}
              </div>
            ) : null}
            <Input
              type="name"
              id="name"
              placeholder="Your Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
          </div>

          <Label htmlFor="password">Password</Label>
          <div>
            {formik.touched.password && formik.errors.password ? (
              <div className="bg-[#D9534F] text-white text-[10px] pl-1">
                {formik.errors.password}
              </div>
            ) : null}
            <Input
              type="password"
              id="password"
              placeholder="Your password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
          </div>
          <button
            className="bg-green-500 p-2 rounded-[8px] text-white"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
