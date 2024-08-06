import { Button, Row, Col } from 'antd';
import { HomeOutlined, GoldOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import ConnectWallet from '../components/ConnectWallet';

const Header = () => {
    const location = useLocation();
    console.log(location)

    return (
        <div className="text-center leading-[90px] bg-[#c43813f2] pt-[10px] pb-[10px] pr-[40px]">
            <Row type="flex" align='middle'>
                <Col span={16}>
                </Col>
                <Col span={5}>
                    <Row type="flex" justify="space-around">
                        <Link to="/">
                            <Button
                                className="transition-all duration-300 opacity-100 before:bg-gradient-to-bl after:opacity-0"
                                type={location.pathname === '/' && "primary"}
                                icon={<HomeOutlined />}
                            >
                                Home
                            </Button>
                        </Link>
                        <Link to="/mint">
                            <Button
                                className="transition-all duration-300 opacity-100 before:bg-gradient-to-bl after:opacity-0"
                                type={location.pathname === '/mint' && "primary"}
                                icon={<GoldOutlined />}
                            >Mint</Button>
                        </Link>

                    </Row>
                </Col>
                <Col span={3}>
                    <ConnectWallet />
                </Col>
            </Row >
        </div >
    );
};

export default Header;