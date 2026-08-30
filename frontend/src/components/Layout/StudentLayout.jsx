import { Outlet } from 'react-router-dom';
import { Header, Footer } from '../Common/index.jsx';

export function StudentLayout() {
  return (
    <div className="layout student-layout">
      <Header />
      <main className="layout-main">
        <div className="container narrow">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
