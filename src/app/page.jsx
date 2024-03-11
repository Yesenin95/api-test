'use client'
import React, { useState, useEffect } from 'react';
import md5 from 'md5'; // Библиотека для вычисления md5 хэша
import styles from './page.module.css'
import Spinner from './spinner'
const API_URL = 'https://api.valantis.store:41000/';

const Home = () => {
   const [loading, setLoading] = useState(false);
   const [products, setProducts] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [searchTerm, setSearchTerm] = useState('');
   const [error, setError] = useState('');

   // Функция для генерации заголовка X-Auth
   const generateAuthHeader = () => {
      const password = 'Valantis'; // Ваш пароль
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Текущий день в формате ГГГГММДД
      return md5(`${password}_${timestamp}`);
   };

   // Функция для отправки запроса к API
   const fetchData = async (action, params = {}) => {
      try {
         const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'X-Auth': generateAuthHeader(),
            },
            body: JSON.stringify({ action, params }),
         });
         const data = await response.json();
         if (data.error) {
            throw new Error(data.error);
         }
         return data.result;
      } catch (error) {
         console.error('API Error:', error.message);
         setError(error.message);
      }
   };

   // Функция для загрузки списка товаров
   const loadProducts = async () => {
      setLoading(true);
      try {
         const offset = (currentPage - 1) * 50;
         const productIds = await fetchData('get_ids', { offset, limit: 50 });
         const productsData = await fetchData('get_items', { ids: productIds });
         setProducts(productsData);
         setLoading(false);
      } catch (error) {
         console.error('Error while loading products:', error);
         setError(error.message);
         setLoading(false);
      }
   };

   const loadTotalPages = async () => {
      setLoading(true);
      try {
         const productIds = await fetchData('get_ids');
         if (productIds) {
            setTotalPages(Math.ceil(productIds.length / 50));
         }
      } catch (error) {
         console.error('Error while loading total pages:', error);
         setError(error.message);
      }
      setLoading(false);
   };

   useEffect(() => {
      loadProducts();
      loadTotalPages();
   }, [currentPage]);

   // Функция для обработки события изменения страницы
   const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
   };

   // Функция для обработки события изменения строки поиска
   const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
   };

   // Функция для фильтрации товаров по строке поиска
   const filteredProducts = products.filter((product) =>
      product.product.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return <>
      {loading ? (
         <Spinner />
      ) : (
         <>
            <div className={styles.container}>
               <h1>Список товаров</h1>
               <input type="text" placeholder="Поиск товаров..." value={searchTerm} onChange={handleSearchChange} className={styles.input} />
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Цена</th>
                        <th>Бренд</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredProducts.map((product) => (
                        <tr key={product.id} className={styles.tr}>
                           <td>{product.id}</td>
                           <td>{product.product}</td>
                           <td>{product.price}</td>
                           <td>{product.brand}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {totalPages > 1 && (
                  <div>
                     <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={styles.button}>
                        Предыдущая страница
                     </button>
                     <span>Страница {currentPage} из {totalPages}</span>
                     <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={styles.button}>
                        Следующая страница
                     </button>
                  </div>
               )}
               {error && <div style={{ color: 'red' }}>{error}</div>}
            </div>
         </>
      )
      }
   </>
};

export default Home;
