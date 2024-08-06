'use client';
import '../../dashboard.css';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { RxAvatar } from 'react-icons/rx';
import { axiosInstance } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Table } from 'flowbite-react';
import Swal from 'sweetalert2';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useDebounce } from 'use-debounce';
import { fetchUser, deleteUser } from '@/helpers/fetchUser';
import { TUser } from '@/models/user';
import Link from 'next/link';

const Users = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<TUser[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [value] = useDebounce(search, 1000);
  const router = useRouter();

  async function onClickEdit(id: string) {
    const axios = axiosInstance();
    try {
      const response = await axios.get(`/admins/${id}`);
      router.push(`/dashboard/admin/edit/${id}`);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser(page, limit, value, setUsers);
  }, [page, limit, value]);

  const isLastPage = users.length < limit;

  function handleDelete(id: string) {
    Swal.fire({
      title: 'Are you sure you want to delete this?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(id, page, limit, value, setUsers);
          Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
        } catch (error) {
          Swal.fire(
            'Error!',
            'There was a problem deleting the user.',
            'error',
          );
        }
      }
    });
  }

  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full top-[49px] left-[290px] h-lvh">
        <Sidebar />
        <div className="py-6 px-10 w-full flex flex-col min-h-screen">
          <div className="flex justify-between items-center">
            {/* ini dikiri */}
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Admin Store
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Admin Store
              </div>
            </div>
            {/* ini dikanan */}
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Link
                  href={'/dashboard/admin/add'}
                  className="bg-[#F4F7FE] px-3 text-[#2B3674] font-dm-sans text-14px font-bold rounded-full flex items-center "
                >
                  +Store Admin
                </Link>
              </div>
              <div>
                <RxAvatar className="h-7 w-7" />
              </div>
            </div>
          </div>
          <div className="flex-grow">
            <div className="overflow-x-auto pt-5">
              <Table>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Store</Table.HeadCell>
                  <Table.HeadCell className="sr-only">
                    <span>Delete</span>
                  </Table.HeadCell>
                  <Table.HeadCell className="sr-only">
                    <span>Edit</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user, index) => (
                      <Table.Row key={user.id} className="bg-white">
                        <Table.Cell>{index + 1}</Table.Cell>
                        <Table.Cell>{user.name}</Table.Cell>
                        <Table.Cell>{user.email}</Table.Cell>
                        <Table.Cell>
                          {user.store ? user.store.name : 'No Store'}
                        </Table.Cell>
                        <Table.Cell
                          onClick={() => user.id && handleDelete(user.id)}
                          className="font-medium text-red-600 cursor-pointer"
                        >
                          Delete
                        </Table.Cell>
                        <Table.Cell className="font-medium text-green-600">
                          <button
                            onClick={() => user.id && onClickEdit(user.id)}
                          >
                            Edit
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row className="bg-white">
                      <Table.Cell colSpan={6} className="text-center">
                        No users found.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
          <div className="flex justify-center items-center gap-5 pb-14">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`flex items-center font-bold gap-1  px-5 py-1 rounded-full ${page === 1 ? 'bg-gray-400 text-gray-200' : 'bg-[#11047A] text-white'}`}
            >
              <MdNavigateBefore /> Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={isLastPage}
              className={`flex items-center font-bold gap-1 px-5 py-1 rounded-full ${isLastPage ? 'bg-gray-400 text-gray-200' : 'bg-[#11047A] text-white'}`}
            >
              Next <MdNavigateNext />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Users;
