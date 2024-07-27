'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { FaCopy, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import { LuClipboardList } from 'react-icons/lu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ProfileComponent() {
  const referralCode = '56B6B';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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

  return (
    <>
      <div className="pt-9">
        <div className="p-2">
          <center>
            <img src="/img/dummy.jpg" className="rounded-full w-[30%]" />
            <div className="w-full mt-3">
              <p>Nama</p>
              <div className="flex justify-center items-center">
                <p className="mr-2">{referralCode}</p>
                <FaCopy onClick={handleCopy} className="cursor-pointer" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        defaultValue="Pedro Duarte"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        defaultValue="@peduarte"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
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
