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
const Calendar = lazy(() => import('../pages/Calendar'));
const Blank = lazy(() => import('../pages/Blank'));
const FormElements = lazy(() => import('../pages/Forms/FormElements'));
const BasicTables = lazy(() => import('../pages/Tables/BasicTables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Avatars = lazy(() => import('../pages/UiElements/Avatars'));
const Badges = lazy(() => import('../pages/UiElements/Badges'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Images = lazy(() => import('../pages/UiElements/Images'));
const Videos = lazy(() => import('../pages/UiElements/Videos'));
const LineChart = lazy(() => import('../pages/Charts/LineChart'));
const BarChart = lazy(() => import('../pages/Charts/BarChart'));
const SignIn = lazy(() => import('../pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('../pages/AuthPages/SignUp'));
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
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
