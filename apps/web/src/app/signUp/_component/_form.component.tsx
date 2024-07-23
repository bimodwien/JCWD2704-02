'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import RegisterIcon from '../../../../public/google.svg';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { axiosInstance } from '../../_lib/axios';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';
import { auth, provider, signInWithPopup } from '../../_lib/firebase';

export default function FormSignUpComponent() {
  const signUpSchema = Yup.object({
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
  });

  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance().post('/v1/addemail', values);
        Swal.fire({
          title: 'Success',
          text: 'Your email has been registered. Please check your email for verification',
          icon: 'success',
        });
      } catch (error) {
        console.error('Error kirim email:', error);
        Swal.fire({
          title: 'Error',
          text: 'There was an error registering your email. Please try again.',
          icon: 'error',
        });
      }
    },
  });

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName } = result.user;
      const response = await axiosInstance().post('/v1/signUpWithGoogle', {
        uid,
        email,
        name: displayName,
      });
      console.log(response.data.data);
      router.push(`/redeemCode/${response.data.data.id}`);
      Swal.fire({
        title: 'Success',
        text: `Welcome`,
        icon: 'success',
      });
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
          <button
            className="bg-green-500 p-2 rounded-[8px] text-white"
            type="submit"
          >
            Register
          </button>
        </div>
      </form>
      <div className="grid w-full items-center gap-1.5 mt-1">
        <button
          onClick={signInWithGoogle}
          className="border-gray-600 border-solid border p-2 rounded-[8px] flex justify-center items-center"
        >
          <div>
            <Image src={RegisterIcon} width="20" height="20" alt="" />
          </div>
          <div>Sign Up With Google</div>
        </button>
      </div>
    </>
  );
}
