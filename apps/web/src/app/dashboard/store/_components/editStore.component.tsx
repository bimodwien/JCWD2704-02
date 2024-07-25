'use client';

import { getStoreByStoreId, updateStore } from '@/helpers/fetchStore';
import { TStore } from '@/models/store.model';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation'; // atau useRouter jika tidak menggunakan app directory
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditStoreComponent() {
  const { id } = useParams(); // atau gunakan useRouter untuk mengambil ID dari URL params
  const [storeData, setStoreData] = useState<TStore | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof id === 'string') {
      getStoreByStoreId(id, setStoreData);
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      name: storeData?.name || '',
      address: storeData?.address || '',
      latitude: storeData?.latitude?.toString() || '',
      longitude: storeData?.longitude?.toString() || '',
      type: storeData?.type || '',
      city: storeData?.city || '',
      province: storeData?.province || '',
      postalCode: storeData?.postalCode?.toString() || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Nama wajib diisi').min(5),
      address: Yup.string().required('Alamat wajib diisi'),
    }),
    onSubmit: async (values) => {
      if (typeof id === 'string') {
        const updatedStore = await updateStore(id, {
          ...values,
          latitude: parseFloat(values.latitude),
          longitude: parseFloat(values.longitude),
          postalCode: parseInt(values.postalCode),
        });
        router.push('/dashboard/store');
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
            center: storeData
              ? {
                  lat: parseFloat(storeData.latitude.toString()),
                  lng: parseFloat(storeData.longitude.toString()),
                }
              : { lat: -6.2, lng: 106.816666 },
            zoom: 15,
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
            position: storeData
              ? {
                  lat: parseFloat(storeData.latitude.toString()),
                  lng: parseFloat(storeData.longitude.toString()),
                }
              : map.getCenter(),
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
            formik.setFieldValue('latitude', location.lat().toString());
            formik.setFieldValue('longitude', location.lng().toString());

            updateLocationData(location);
          });

          marker.addListener('dragend', () => {
            const newPosition = marker.getPosition();
            if (newPosition) {
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
  }, [storeData]);

  return (
    <>
      <section className="bg-[#f4f7fe] w-full h-lvh">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Edit Store
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
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Map
                  </label>
                  <div
                    ref={mapRef}
                    className="w-full h-96 bg-gray-200 rounded-lg"
                  />
                </div>
                <div className="pt-1">
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
                    {...formik.getFieldProps('type')}
                  />
                </div>
                <div className="pt-1">
                  <label
                    htmlFor="city"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    City Name
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('city')}
                  />
                </div>
                <div className="pt-1">
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
                    {...formik.getFieldProps('province')}
                  />
                </div>
                <div className="pt-1">
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
                    {...formik.getFieldProps('postalCode')}
                  />
                </div>
                <div className="pt-1 hidden">
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
                    {...formik.getFieldProps('latitude')}
                    readOnly
                  />
                </div>
                <div className="pt-1 hidden">
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
                    {...formik.getFieldProps('longitude')}
                    readOnly
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Submit
                  </button>
                  <Link
                    href="/dashboard/store"
                    className="ml-4 text-primary-600 hover:underline"
                  >
                    Back
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
