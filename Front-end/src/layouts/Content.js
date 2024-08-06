import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Mint from '../pages/Mint';
import Dashboard from '../pages/Dashobard';

const Content = () => {
    return (
        <div className="bg-[#eeeff1]">
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/mint' element={<Mint />} />
                <Route path='/owner' element={<Dashboard />} />
            </Routes>
        </div>
    );
};

export default Content;