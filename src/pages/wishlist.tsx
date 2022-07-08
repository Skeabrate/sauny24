import React from 'react';
import type { NextPage } from 'next';
import HeadComponent from 'components/Head/Head';

const Wishlist: NextPage = () => {
  return (
    <main>
      <HeadComponent title='Sauny24 - Wishlist' />

      <h1>Lista życzeń</h1>
    </main>
  );
};

export default Wishlist;