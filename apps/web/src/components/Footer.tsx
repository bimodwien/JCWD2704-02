import { BsInstagram, BsTwitter } from 'react-icons/bs';
import { FaFacebook } from 'react-icons/fa6';
import { LiaLinkedin } from 'react-icons/lia';
export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 w-full">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="text-lg font-bold">
          <a href="/" className="text-white hover:text-gray-400">
            BBH Store
          </a>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
          <a href="/" className="hover:text-gray-400">
            Home
          </a>
          <a href="/" className="hover:text-gray-400">
            Services
          </a>
          <a href="/" className="hover:text-gray-400">
            Contact
          </a>
          <a href="/" className="hover:text-gray-400">
            Privacy Policy
          </a>
        </div>

        <div className="flex gap-4 mt-4 md:mt-0">
          <a
            href="https://facebook.com"
            className="text-gray-400 hover:text-white"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="https://twitter.com"
            className="text-gray-400 hover:text-white"
            aria-label="Twitter"
          >
            <BsTwitter />
          </a>
          <a
            href="https://instagram.com"
            className="text-gray-400 hover:text-white"
            aria-label="Instagram"
          >
            <BsInstagram />
          </a>
          <a
            href="https://linkedin.com"
            className="text-gray-400 hover:text-white"
            aria-label="LinkedIn"
          >
            <LiaLinkedin />
          </a>
        </div>
      </div>
      <div className="bg-gray-900 text-center py-2">
        <p className="text-sm">
          © {new Date().getFullYear()} BBHStore. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
