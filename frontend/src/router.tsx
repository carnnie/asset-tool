import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar/navBar';
import Index from './pages/index';
import Mobile from './pages/mobile/mobile';
import ItInvent from './pages/it-invent/it-invent';
import ItUtilization from './pages/it-utilization/it-utilization';
import PrintersMng from './pages/printers-mng/printers-mng';
import { UserContext, user } from './App';
import { useContext } from 'react';
import { checkPermission, permissions } from './permissions';
import { SingleEdit } from './pages/single-edit/singleEdit';
import { ItInventMng } from './pages/it-invent-mng/itInventMng';
import { GroupEdit } from './pages/group-edit/groupEdit';
import { FacilityInvent } from './pages/facility-invent/facilityInvent';

export default function Router() {
  const user = useContext<user>(UserContext);
  return (
    <BrowserRouter>
      <Navbar /> {/* navbar mast be insigt router or <Link> wouldn't wok */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mobile" element={<Mobile />} />
        <Route
          path="/it-invent"
          element={checkPermission(user, permissions.ItInvent) ? <ItInvent /> : <Index />}
        />
        <Route
          path="/it-utilization"
          element={checkPermission(user, permissions.ItStorage) ? <ItUtilization /> : <Index />}
        />
        <Route
          path="/single-edit"
          element={checkPermission(user, permissions.ItInvent) ? <SingleEdit /> : <Index />}
        />
        <Route
          path="/group-edit"
          element={checkPermission(user, permissions.ItInvent) ? <GroupEdit /> : <Index />}
        />
        <Route
          path="/it-invent-mng"
          element={checkPermission(user, permissions.ItInvent) ? <ItInventMng /> : <Index />}
        />
        <Route
          path="/printres-mng"
          element={checkPermission(user, permissions.ItInvent) ? <PrintersMng /> : <Index />}
        />
        <Route
          path="/facility-invent"
          element={checkPermission(user, permissions.ItInvent) ? <FacilityInvent /> : <Index />}
        />
      </Routes>
    </BrowserRouter>
  );
}
