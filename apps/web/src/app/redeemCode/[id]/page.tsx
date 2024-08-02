'use client';
import React, { useEffect, useState } from 'react';
import FormRedeemCode from '../_component/_formReedemCode';

const EditAdmin = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <FormRedeemCode id={params.id} />
    </>
  );
};

export default EditAdmin;
