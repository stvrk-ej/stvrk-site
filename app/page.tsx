import Hero from '@/components/Hero';
import ChoosePath from '@/components/ChoosePath';
import styles from './page.module.css';

export default function Home() {
  return (
    /*
     * Order matters. The white panel is painted first so the hero layers, which come
     * after it and blend against it, can treat it as their backdrop. Nothing between
     * <main> and a layer may create a stacking context or the blend gets isolated.
     */
    <main className={styles.page}>
      <div className={styles.heroSpace} />
      <ChoosePath />
      <Hero />
    </main>
  );
}
