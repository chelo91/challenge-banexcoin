import { redirect } from 'next/navigation';
import { isAuthenticated } from './utils/auth';

export default function Home() {
  if (!isAuthenticated()) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
}
