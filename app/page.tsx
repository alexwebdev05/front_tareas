'use client'

import { useRouter } from 'next/navigation'
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter()

  return (
    <div className={styles.page}>
      <h2>Home page</h2>
      <button type='button' onClick={() => router.push('/login')}>Login</button>
      <button type='button' onClick={() => router.push('/register')}>Register</button>
    </div>
  );
}
