import Image from 'next/image';
import FormRedeemCode from '../_component/_formReedemCode'; // Adjust the path as per your file structure
import { Form } from 'formik';

export default function SignUp({ params }: any) {
  return (
    <>
      <center>
        <div className="py-[30px] md:max-w-[50%]">
          <div className="">
            <p className=" font-bold text-center text-[20px]">
              Input Referred Code
            </p>
            <div className="text-center text-[14px]"></div>
          </div>
          <div className="p-4 md:p-0">
            <div className="">
              <div className="md:py-8">
                <Image
                  src="/otp-security.svg"
                  width={320}
                  height={320}
                  alt=""
                  className="md:ml-[50px] lg:ml-[90px] lg:w-[420px] 2xl:w-[600px]"
                />
              </div>
              <div className="md:p-2 lg:mb-[50px] 2xl:mb-[110px]">
                <p>
                  *Note : If you dont have referral code you can skip this.{' '}
                </p>
                <FormRedeemCode id={params.id} />
              </div>
            </div>
          </div>
        </div>
      </center>
    </>
  );
}
