// components/CustomModal.tsx
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import * as Yup from 'yup';

interface UploadModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  onConfirm: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
}) => {
  const imageRef = useRef<HTMLInputElement>(null);

  const initialValues = {
    paymentProof: null,
    image_url:
      'https://dinkes.dairikab.go.id/wp-content/uploads/sites/12/2022/03/default-img.gif',
  };
  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({}),
    onSubmit: async (values) => {
      try {
        const newData = new FormData();
        if (values.paymentProof)
          newData.append('paymentProof', values.paymentProof);

        console.log(
          'Data yang diinput:',
          Object.fromEntries(newData.entries()),
        );

        const { data } = await axiosInstance().patch(
          `/order/${order.id}`,
          newData,
        );
        alert(data.message);
        onConfirm();
      } catch (error) {
        if (error instanceof AxiosError) alert(error.response?.data?.message);
        else if (error instanceof Error) console.log(error.message);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-3 rounded-lg shadow-lg w-[350px] h-[550px]">
        <div className="flex flex-col gap-2 justify-center items-center h-full w-full overflow-auto ">
          <div className="font-semibold text-lg text-center">Payment Proof</div>
          <form
            className="flex flex-col gap-5 justify-center items-center"
            onSubmit={formik.handleSubmit}
          >
            <div>
              <input
                type="file"
                ref={imageRef}
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    formik.setFieldValue('paymentProof', e.target.files[0]);
                    formik.setFieldValue(
                      'image_url',
                      window.URL.createObjectURL(e.target.files[0]),
                    );
                  }
                }}
              />
              <img
                src={formik.values.image_url}
                onClick={() => imageRef.current?.click()}
                alt=""
                className="w-60 h-[400px] rounded-xl object-cover cursor-pointer border border-gray-200"
              />
            </div>
            <div className="flex justify-center gap-5">
              <button
                onClick={onClose}
                className="w-24 px-2 py-1 bg-gray-500 text-white rounded-full hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-24 px-2 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
