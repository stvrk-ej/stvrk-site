import type { Metadata } from 'next';
import styles from '../stub.module.css';

export const metadata: Metadata = { title: 'beats — stvrk' };

export default function BeatsPage() {
  return (
    <main className={styles.stub}>
      <h1 className={styles.title}>beats</h1>
      <a className={styles.back} href="/">
        back
      </a>
    </main>
  );
}
