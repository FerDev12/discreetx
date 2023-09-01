import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className='min-h-screen grid place-items-center'>{children}</div>;
}
