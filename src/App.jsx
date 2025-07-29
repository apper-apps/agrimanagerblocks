import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Fields from "@/components/pages/Fields";
import Crops from "@/components/pages/Crops";
import PlantingRecords from "@/components/pages/PlantingRecords";
import FertilizerManagement from "@/components/pages/FertilizerManagement";
function App() {
  return (
    <BrowserRouter>
      <div className="App">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="fields" element={<Fields />} />
            <Route path="crops" element={<Crops />} />
            <Route path="planting-records" element={<PlantingRecords />} />
            <Route path="fertilizer" element={<FertilizerManagement />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;