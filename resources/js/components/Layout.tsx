import React, { ReactNode } from 'react';
import Link from 'next/link';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 900, margin: '0 auto', padding: 20 }}>
    <header style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
      <nav>
        <Link href="/admin/roles" style={{ marginRight: 15 }}>
          Roles
        </Link>
      </nav>
    </header>
    <main>{children}</main>
  </div>
);

export default Layout;
