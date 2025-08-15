import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '../components/common/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import RequireAuth from './RequireAuth';
import AppLayout from '../layout/AppLayout';

const Home = lazy(() => import('../pages/Dashboard/Home'));
const Category = lazy(() => import('../pages/Category'));
const Order = lazy(() => import('../pages/Order'));
const UserProfiles = lazy(() => import('../pages/UserProfiles'));
const Book = lazy(() => import('../pages/Products/Book'));
const Author = lazy(() => import('../pages/Products/Author'));
const Seller = lazy(() => import('../pages/Products/Seller'));
const Specification = lazy(() => import('../pages/Products/Specification'));
const Image = lazy(() => import('../pages/Products/Image'));
const Book_Author = lazy(() => import('../pages/Products/Book_Author'));
const Book_Seller = lazy(() => import('../pages/Products/Book_Seller'));
const SignIn = lazy(() => import('../pages/AuthPages/SignIn'));
const NotFound = lazy(() => import('../pages/OtherPage/NotFound'));

export default function AppRouter() {
  return (
    <>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          style: { marginTop: '64px' },
        }}
      />
      <ScrollToTop />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Private Routes */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/category" element={<Category />} />
              <Route path="/order" element={<Order />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/product" element={<Book />} />
              <Route path="/author" element={<Author />} />
              <Route path="/author-product" element={<Book_Author />} />
              <Route path="/seller-product" element={<Book_Seller />} />
              <Route path="/seller" element={<Seller />} />
              <Route path="/specification" element={<Specification />} />
              <Route path="/image" element={<Image />} />

            </Route>
          </Route>

          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
