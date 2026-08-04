import type { Metadata } from 'next';
import styles from '../stub.module.css';

export const metadata: Metadata = { title: 'sound-kits — stvrk' };

export default function SoundKitsPage() {
  return (
    <main className={styles.stub}>
      <h1 className={styles.title}>sound-kits</h1>
      <a className={styles.back} href="/">
        back
      </a>
    </main>
  );
}
