'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { updatePassword } from '@/helpers/user';

export default function AddPasswordComponent() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const signUpSchema = Yup.object({
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        await updatePassword(userId, values.password, values.confirmPassword);
        router.push('/login');
        Swal.fire({
          title: 'Success',
          text: 'Password updated successfully',
          icon: 'success',
        });
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error',
          text: 'There was an error, please input password lagain',
          icon: 'error',
        });
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid w-full items-center gap-1.5">
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
              placeholder="Your Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
          </div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="bg-[#D9534F] text-white text-[10px] pl-1">
                {formik.errors.confirmPassword}
              </div>
            ) : null}
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Your Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
          </div>
          <button
            className="bg-green-500 p-2 rounded-[8px] text-white"
            type="submit"
          >
            Update Password
          </button>
        </div>
      </form>
    </>
  );
}
