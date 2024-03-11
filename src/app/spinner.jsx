import React from 'react';
import styles from './spinner.module.css'; // Файл со стилями для спиннера

const Spinner = () => {
   return (
      <div className={styles.spinner}>
         <div className={styles.doubleBounce1}></div>
         <div className={styles.doubleBounce2}></div>
      </div>
   );
};

export default Spinner;