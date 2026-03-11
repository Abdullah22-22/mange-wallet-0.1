import Sidebar from "../../components/SideBar/SideBar";
import Topbar from "../../components/TopBar/TopBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./dashboard.css";

function Dashboard() {
  const [source, setSource] = useState("local");
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Topbar  source={source} setSource={setSource}/>
        <div className="content-wrapper">
        <Outlet context={{ source, setSource }}  />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
