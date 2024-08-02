'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { FaCopy, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import { LuClipboardList } from 'react-icons/lu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateProfile } from '@/helpers/fetchUser';
import { useAppSelector } from '../../../../hooks';
import { axiosInstance } from '@/lib/axios';

export default function ProfileComponent() {
  const user = useAppSelector((state) => state.auth);
  console.log('====================================');
  console.log(user.id);
  console.log('====================================');
  const referralCode = '56B6B';
  const [profileImage, setProfileImage] = useState('/img/dummy.jpg');
  const [profileImageDialog, setProfileImageDialog] =
    useState('/img/dummy.jpg');

  const formik = useFormik({
    initialValues: {
      email: '',
      name: '',
      profilePicture: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      name: Yup.string().required('Required'),
      profilePicture: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      const axios = axiosInstance();
      console.log('====================================');
      console.log('ID:', user.id);
      console.log('Values:', values);
      console.log('====================================');
      try {
        const response = await axios.patch(
          `/v1/update-profile/${user.id}`,
          values,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        console.log('Response:', response); // Log response data
      } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
      }
    },
  });

  const handleCopy = () => {
    navigator.clipboard
      .writeText(referralCode)
      .then(() => {
        alert('Referral code copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Selected file:', file); // Log input file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setProfileImage(e.target.result.toString());
          formik.setFieldValue('profilePicture', e.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadDialog = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    console.log('Selected file in dialog:', file); // Log input file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setProfileImageDialog(e.target.result.toString());
          formik.setFieldValue('profilePicture', e.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    const input = document.getElementById(
      'imageUploadDialog',
    ) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  return (
    <>
      <div className="pt-9">
        <div className="p-2">
          <center>
            <img src={profileImage} className="rounded-full w-[30%]" />
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div className="w-full mt-3">
              <p>{user.email}</p>
              <div className="flex justify-center items-center">
                <p className="mr-2">{referralCode}</p>
                <FaCopy onClick={handleCopy} className="cursor-pointer" />
              </div>
              <Dialog>
                <DialogTrigger>
                  <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when youre
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={formik.handleSubmit}
                    className="grid gap-4 py-4"
                  >
                    <center>
                      <img
                        src={profileImageDialog}
                        className="rounded-full w-[30%] cursor-pointer"
                        onClick={triggerImageUpload}
                      />
                    </center>
                    <input
                      type="file"
                      id="imageUploadDialog"
                      accept="image/*"
                      onChange={handleImageUploadDialog}
                      style={{ display: 'none' }}
                    />
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        className="col-span-3"
                      />
                      {formik.touched.email && formik.errors.email ? (
                        <div>{formik.errors.email}</div>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        className="col-span-3"
                      />
                      {formik.touched.name && formik.errors.name ? (
                        <div>{formik.errors.name}</div>
                      ) : null}
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </center>
        </div>

        <div className="flex justify-center items-center py-3">
          <div className="w-36 h-20 py-4 bg-gray-200 rounded-lg flex flex-col justify-center items-center cursor-pointer">
            <FaPlus />
            <p>Add Address</p>
          </div>
        </div>
        <div>
          <div>
            <div className="flex justify-between pl-2 pr-2">
              <LuClipboardList />
              <a className="text-[10px]">Lihat riwayat Pesanan</a>
            </div>
            <div className="flex">
              <div>
                <FaMoneyBillWave />
                <p>Belum Bayar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
