'use client';
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';

const AddStoreComponent = () => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');

  const initialValues = {
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    type: '',
    cityName: '',
    province: '',
    postalCode: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Nama wajib diisi').min(5),
      address: Yup.string().required('Alamat wajib diisi'),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosInstance().post('/store/create', values);
        alert(data.message);
        router.push('/dashboard/store');
      } catch (error) {
        if (error instanceof AxiosError) alert(error.response?.data?.message);
        else if (error instanceof Error) console.log(error.message);
      }
    },
  });

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyD4TxR4a0lNTh4eifc7Fj266bJ7Q1JvLAs',
      version: 'weekly',
      libraries: ['places'],
      language: 'id',
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current && addressInputRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: -6.2, lng: 106.816666 },
            zoom: 10,
            streetViewControl: false,
            mapTypeControl: false,
          });

          const geocoder = new google.maps.Geocoder();
          const autocomplete = new google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              componentRestrictions: { country: 'id' },
              fields: ['address_components', 'geometry'],
              types: ['address'],
            },
          );

          const updateLocationData = (location: any) => {
            geocoder.geocode({ location }, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                const addressComponents = results[0].address_components;
                let city = '';
                let prov = '';
                let postal = '';
                let type = '';
                addressComponents.forEach((component) => {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                    type = 'Kota';
                  } else if (
                    component.types.includes('administrative_area_level_2')
                  ) {
                    if (!city) {
                      city = component.long_name
                        .replace('Kabupaten', '')
                        .replace('Kota', '')
                        .trim();
                    }
                    type = component.long_name.includes('Kabupaten')
                      ? 'Kabupaten'
                      : 'Kota';
                  } else if (
                    component.types.includes('administrative_area_level_1')
                  ) {
                    prov = component.long_name;
                  } else if (component.types.includes('postal_code')) {
                    postal = component.long_name;
                  }
                });

                if (!city && type === 'Kota' && prov) {
                  city = prov;
                }

                setCityName(city);
                setType(type);
                setProvince(prov);
                setPostalCode(postal);

                formik.setFieldValue('cityName', city);
                formik.setFieldValue('type', type);
                formik.setFieldValue('province', prov);
                formik.setFieldValue('postalCode', postal);
                formik.setFieldValue('address', results[0].formatted_address);
              } else {
                console.error('Geocoder failed due to: ' + status);
              }
            });
          };

          const marker = new google.maps.Marker({
            map,
            position: map.getCenter(),
            draggable: true,
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
              console.error('Location not available');
              return;
            }

            const location = place.geometry.location;
            map.setCenter(location);
            marker.setPosition(location);

            formik.setFieldValue(
              'address',
              addressInputRef.current?.value || '',
            );
            setLatitude(location.lat().toString());
            setLongitude(location.lng().toString());
            formik.setFieldValue('latitude', location.lat().toString());
            formik.setFieldValue('longitude', location.lng().toString());

            updateLocationData(location);
          });

          marker.addListener('dragend', () => {
            const newPosition = marker.getPosition();
            if (newPosition) {
              setLatitude(newPosition.lat().toString());
              setLongitude(newPosition.lng().toString());
              formik.setFieldValue('latitude', newPosition.lat().toString());
              formik.setFieldValue('longitude', newPosition.lng().toString());

              updateLocationData(newPosition);
            }
          });
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API', error);
      });
  }, []);

  return (
    <>
      <section className="bg-[#f4f7fe] w-full h-lvh">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Add Store
              </h1>
              <form
                className="space-y-4 md:space-y-4"
                onSubmit={formik.handleSubmit}
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Name Store
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('name')}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-500">{formik.errors.name}</div>
                  ) : null}
                </div>
                <div className="pt-1">
                  <label
                    htmlFor="address"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    ref={addressInputRef}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('address')}
                  />
                  {formik.touched.address && formik.errors.address ? (
                    <div className="text-red-500">{formik.errors.address}</div>
                  ) : null}
                </div>
                <div ref={mapRef} className="w-full h-64 rounded-lg" />
                <div className="hidden">
                  <div>
                    <label
                      htmlFor="latitude"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Latitude
                    </label>
                    <input
                      type="text"
                      id="latitude"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      value={latitude}
                      readOnly
                    />
                  </div>
                </div>
                <div className="hidden">
                  <div>
                    <label
                      htmlFor="longitude"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Longitude
                    </label>
                    <input
                      type="text"
                      id="longitude"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      value={longitude}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Type
                  </label>
                  <input
                    type="text"
                    id="type"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={type}
                    readOnly
                  />
                </div>
                <div>
                  <label
                    htmlFor="cityName"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    City Name
                  </label>
                  <input
                    type="text"
                    id="cityName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={cityName}
                    readOnly
                  />
                </div>
                <div>
                  <label
                    htmlFor="province"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Province
                  </label>
                  <input
                    type="text"
                    id="province"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={province}
                    readOnly
                  />
                </div>
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={postalCode}
                  />
                </div>
                <button
                  type="submit"
                  className="text-white bg-blue-700 rounded-lg p-2"
                >
                  Add Store
                </button>
                <Link
                  href="/dashboard/admin"
                  className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Cancel
                </Link>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddStoreComponent;
