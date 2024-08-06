import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers, utils } from 'ethers';
import Web3Modal from 'web3modal';
import { Button, Modal, Row, Col } from 'antd';
import { AuditOutlined, LoadingOutlined } from '@ant-design/icons';
import networks from "../utils/networksMap.json";
import { updateAccountData, disconnect } from "../features/blockchain"

const eth = window.ethereum;
let web3Modal = new Web3Modal();

const ConnectWallet = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.blockchain.value);
    const [injectedProvider, setInjectedProvider] = useState();
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const [loading, setLoading] = useState(false);

    const fetchAccountData = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setLoading(true);
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);

                setInjectedProvider(provider);

                const signer = provider.getSigner();
                const chainId = await provider.getNetwork();
                const account = await signer.getAddress();
                const balance = await signer.getBalance();
                dispatch(updateAccountData(
                    {
                        account: account,
                        balance: utils.formatUnits(balance),
                        network: networks[String(chainId.chainId)]
                    }
                ));

                console.log({
                    account: account,
                    balance: utils.formatUnits(balance),
                    network: networks[String(chainId.chainId)]
                });
                setLoading(false);
            } catch (err) {
                setLoading(false);
                window.alert('An error has occured.');
                console.log(err);
            }
        }
        else {
            console.log("Please install metamask.");
            window.alert("Please Install Metamask.");
        }
    };

    const disconnectBtnClicked = async () => {
        web3Modal.clearCachedProvider();
        if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
            await injectedProvider.provider.disconnect();
            setInjectedProvider(null);
        }
        dispatch(disconnect());
        setShow(false);
    }

    useEffect(() => {
        if (eth) {
            eth.on('chainChanged', (chainId) => {
                fetchAccountData();
            })
            eth.on('accountsChanged', (accounts) => {
                fetchAccountData();
            })
        }
    }, []);

    const isConnected = data.account !== "";

    return (
        <>
            {isConnected ? (
                <>
                    <Button
                        onClick={handleShow}
                        icon={loading ? <LoadingOutlined /> : <AuditOutlined />}
                    >
                        {data.account &&
                            `${data.account.slice(0, 6)}...${data.account.slice(
                                data.account.length - 6,
                                data.account.length
                            )}`}
                    </Button>
                    <Modal
                        title="Wallet Info"
                        open={show}
                        okText="Disconnect"
                        cancelText={<a href="/owner">to Owner Page</a>}
                        onOk={() => {
                            disconnectBtnClicked();
                        }}
                        onCancel={() => { setShow(false); }}
                    >
                        <Row align='middle'>
                            <Col span={4}>Account:</Col>
                            <Col span={20}>{data.account}</Col>
                        </Row>
                        <Row align='middle'>
                            <Col span={4}>Balance:</Col>
                            <Col span={20}>{data.balance && parseFloat(data.balance).toFixed(30)} ETH</Col>
                        </Row>
                        <Row align='middle'>
                            <Col span={4}>Network:</Col>
                            <Col span={20}>{data.network}</Col>
                        </Row>
                    </Modal>
                </>
            ) : (
                <Button onClick={fetchAccountData}>
                    {loading && <LoadingOutlined />}
                    Connect Wallet
                </Button>
            )
            }
        </>
    );
};

export default ConnectWallet;