import { paymentSrc } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import React, { useRef, useState, useEffect } from 'react';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Swal from 'sweetalert2';

interface UploadModalProps {
  isOpen: boolean;
  order: TOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
}) => {
  dayjs.extend(relativeTime);
  const imageRef = useRef<HTMLInputElement>(null);
  const defaultImageUrl =
    'https://dinkes.dairikab.go.id/wp-content/uploads/sites/12/2022/03/default-img.gif';
  const [imageSrc, setImageSrc] = useState(defaultImageUrl);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [initialImageUrl, setInitialImageUrl] = useState(defaultImageUrl);

  useEffect(() => {
    if (order) {
      const initialUrl = order.checkedAt
        ? `${paymentSrc}${order.id}`
        : defaultImageUrl;
      setImageSrc(initialUrl);
      setInitialImageUrl(initialUrl);
      setSubmitDisabled(true);
    }
  }, [order]);

  const initialValues = {
    paymentProof: null,
    image_url: defaultImageUrl,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({}),
    onSubmit: async (values) => {
      try {
        const newData = new FormData();
        if (values.paymentProof)
          newData.append('paymentProof', values.paymentProof);
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to submit the payment proof?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, submit',
          cancelButtonText: 'No, cancel',
        });

        if (result.isConfirmed) {
          const { data } = await axiosInstance().patch(
            `/orders/${order?.id}`,
            newData,
          );
          Swal.fire('Success', data.message, 'success');
          onConfirm();
        }
      } catch (error) {
        if (error instanceof AxiosError)
          Swal.fire(
            'Error',
            error.response?.data?.message || 'An error occurred',
            'error',
          );
        else if (error instanceof Error) console.log(error.message);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      formik.setFieldValue('paymentProof', file);
      formik.setFieldValue('image_url', window.URL.createObjectURL(file));
      setImageSrc(window.URL.createObjectURL(file));

      if (order?.checkedAt) {
        const oldFileUrl = `${paymentSrc}${order.id}`;
        if (file.name !== oldFileUrl) {
          setSubmitDisabled(false);
        } else {
          setSubmitDisabled(true);
        }
      } else {
        setSubmitDisabled(false);
      }
    }
  };

  const handleClose = () => {
    setImageSrc(initialImageUrl);
    setSubmitDisabled(true);
    formik.resetForm();
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-3 rounded-lg shadow-lg w-[350px] h-[550px]">
        <div className="flex flex-col gap-2 justify-center items-center h-full w-full overflow-auto ">
          <div className="font-semibold text-lg text-center">Payment Proof</div>
          {order.status === 'waitingPayment' && order.paidAt && (
            <div className="text-center text-red-500 font-semibold text-xs flex-col px-3">
              <div>Sorry, your last payment was denied on </div>
              <div>
                {dayjs(order.checkedAt).format('DD MMMM YYYY, HH:mm:ss')}
              </div>
            </div>
          )}
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
                onChange={handleFileChange}
              />
              <img
                src={imageSrc}
                onClick={() => imageRef.current?.click()}
                onError={() => setImageSrc(defaultImageUrl)}
                alt="Payment Proof"
                className="w-60 h-[400px] rounded-xl object-cover cursor-pointer border border-gray-200"
              />
            </div>

            <div className="flex justify-center gap-5">
              <button
                type="button"
                onClick={handleClose}
                className="w-24 px-2 py-1 bg-gray-500 text-white rounded-full hover:bg-gray-400"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-24 px-2 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-500"
                disabled={submitDisabled}
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
