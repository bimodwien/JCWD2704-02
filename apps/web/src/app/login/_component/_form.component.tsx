'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import RegisterIcon from '../../../../public/google.svg';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { axiosInstance } from '../../_lib/axios';
import * as Yup from 'yup';
import axios from 'axios';
import { TUser } from '@/models/user.model';
import { RootState } from '../../_lib/redux/store';
import { userLogin, loginByGoogle } from '@/app/_middleware/auth.middleware';
import { auth, provider, signInWithPopup } from '../../_lib/firebase';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function FormSignInComponent() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth);
  const signUpSchema = Yup.object({
    email: Yup.string().required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      id: '',
      email: '',
      password: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values: TUser) => {
      try {
        await userLogin(values)(dispatch);
        router.push('/');
      } catch (error) {
        console.error('Error:', error);
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('====================================');
      console.log(result);
      console.log('====================================');
      const email = result.user.email;
      if (email != null) {
        await loginByGoogle(email)(dispatch);
        router.push(`/`);
        Swal.fire({
          title: 'Success',
          text: `Welcome`,
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Error signing in with Google: ', error);
      Swal.fire({
        title: 'Error',
        text: 'There was an error signing in with Google. Please try again.',
        icon: 'error',
      });
    }
  };

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

          <button
            className="bg-green-500 p-2 rounded-[8px] text-white"
            type="submit"
          >
            Login
          </button>
        </div>
      </form>
      <div className="grid w-full items-center gap-1.5 mt-1">
        <button
          onClick={handleGoogleLogin}
          className="border-gray-600 border-solid border p-2 rounded-[8px] flex justify-center items-center"
        >
          <div>
            <Image src={RegisterIcon} width="20" height="20" alt="" />
          </div>
          <div>Login With Google</div>
        </button>
        <Link href="/resetPassword/addEmail">Forgot Password ?</Link>
        <Link href="/forgot-password">Forgot Password ?</Link>
      </div>
    </>
  );
}
