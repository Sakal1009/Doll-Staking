import { useState, useEffect } from 'react';
import { Button, InputNumber, Tooltip } from 'antd';
import { SaveOutlined, PauseCircleOutlined, PoweroffOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import nftContract from '../artifacts/DollNFT.sol/DollNFT.json';
import { nftContractAddress, ownerAddress, networkDeployedTo } from '../utils/contracts-config';
import networkMap from '../utils/networksMap.json';

const Dashboard = () => {
    const navigate = useNavigate();
    const data = useSelector((state) => state.blockchain.value);

    const [appInfo, setAppInfo] = useState({
        nftContractBalance: 0,
        nftContractPaused: 1,
        maxMintAmountPerTx: 5,
        mintCost: 0
    });

    const [loading, setLoading] = useState(false);

    const getAppInfo = async () => {
        try {
            setLoading(true);
            if (data.network === networkMap[networkDeployedTo] && data.acount !== '') {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider);
                if (ownerAddress !== data.account) {
                    navigate('/');
                }
                const balance = await provider.getBalance(nftContractAddress);
                console.log('balance', Number(ethers.utils.formatUnits(balance, 'ether')))
                const ispaused = await nft_contract.callStatic.paused();
                const _fee = await nft_contract.callStatic.cost();
                const _maxMintAmount = await nft_contract.callStatic.maxMintAmountPerTx();
                setAppInfo({
                    nftContractBalance: Number(ethers.utils.formatUnits(balance, 'ether')),
                    nftContractPaused: Number(ispaused),
                    maxMintAmountPerTx: _maxMintAmount,
                    mintCost: Number(ethers.utils.formatUnits(_fee, 'ether'))
                });
            }
            else {
                navigate('/');
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            window.alert("An error has occured.");
            console.log(err);
        }
    };

    const changeMintAmount = async () => {
        if (data.network === networkMap[networkDeployedTo]) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
                const signer = provider.getSigner();
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const change_tx = await nft_contract.setMaxMintAmountPerTx(appInfo.maxMintAmountPerTx);
                await change_tx.wait();
                setLoading(false);
                window.location.reload();
                window.alert('Change Mint Amount - Success!');
            } catch (err) {
                setLoading(false);
                window.alert('An error has occured.');
                console.log(err);
            }
        }
    };

    const withdraw = async () => {
        if (data.network === networkMap[networkDeployedTo]) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
                const signer = provider.getSigner();
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const withdraw_tx = await nft_contract.withdraw();
                await withdraw_tx.wait();
                setLoading(false);
                window.location.reload();
                window.alert('Withdraw Success!');
            } catch (err) {
                setLoading(false);
                window.alert('An error has occured.');
                console.log(err);
            }
        }
    };


    const changeMintCost = async () => {
        if (data.network === networkMap[networkDeployedTo]) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
                const signer = provider.getSigner();
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const change_tx = await nft_contract.setCost(ethers.utils.parseEther(String(appInfo.mintCost), 'ether'));
                await change_tx.wait();
                setLoading(false);
                window.location.reload();
                window.alert('Change Mint Cost - Success!');
            } catch (err) {
                setLoading(false);
                window.alert('An error has occured.');
                console.log(err);
            }
        }
    };

    const changeContractState = async () => {
        if (data.network === networkMap[networkDeployedTo]) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
                const signer = provider.getSigner();
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                let pauseState = appInfo.nftContractPaused === 1 ? 2 : 1;
                const change_tx = await nft_contract.pause(pauseState);
                await change_tx.wait();
                setLoading(false);
                window.location.reload();
                window.alert('Change Contract state - Success!');
            } catch (err) {
                setLoading(false);
                window.alert('An error has occured.');
                console.log(err);
            }
        }
    };

    useEffect(() => {
        if (window.ethereum !== undefined)
            getAppInfo();
    }, [data.account]);

    return (
        <div>
            <div className="">
                <div className="flex flex-row justify-center border-y-[20px]">
                    <div className="flex flex-row h-[300px] m-4 rounded-[20px] bg-cyan-500 w-3/4">
                        <div className="flex-none w-[300px] h-[300px]">
                            <img src="assets/img/gold-warehouse.jpg" alt="" className="rounded-tl-[20px] rounded-bl-[20px]" />
                        </div>
                        <div className="grow h-200">
                            <div className="flex flex-row justify-center">
                                <span className="text-[50px] text-purple-200 pt-10 italic font-bold">Current balace of the Contract</span>
                            </div>
                            <div className="flex flex-row justify-center">
                                <span className="px-10 text-[70px] font-semibold text-yellow-200 animate-pulse duration-300">{appInfo && appInfo.nftContractBalance} <b className='text-[50px]'>ETH</b></span>
                            </div>
                            <div className="flex flex-row justify-end">
                                <Button
                                    className='mr-20 text-white bg-gray-600 border-none hover:bg-slate-400 ring-2 hover:ring-2 hover:ring-blue-600'
                                    onClick={withdraw}
                                >
                                    {loading && <LoadingOutlined />}
                                    Withdraw
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-3 mt-3 mx-[300px] outline-double outline-4 outline-gray-600">
                    <div className="grid grid-cols-2">
                        <div className='flex flex-row items-center mt-3 ml-5'>
                            <img src="assets/img/setting.png" alt="" className='w-[30px] h-[30px] mr-3' />
                            <span className="text-[22px]">Setting</span>
                        </div>
                        <div className='flex flex-row items-center justify-end mt-3 mr-5'>
                            <span className='mr-3'>Contarct Status: {appInfo && appInfo.nftContractPaused === 2 ? 'activated' : 'paused'}</span>
                            <Button onClick={changeContractState}>
                                {
                                    loading && <LoadingOutlined />
                                }
                                {!loading && (appInfo && appInfo.nftContractPaused === 2 ? <Tooltip title="Pause"><PauseCircleOutlined /> </Tooltip> : <Tooltip title="active"><PoweroffOutlined /></Tooltip>)}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-center mx-5">
                        <div className='flex flex-row items-center justify-end w-1/2 mb-2 mr-10'>
                            <span className='text-[22px]'>Max Number minted per Transaction:</span>
                        </div>
                        <div className='flex flex-row items-center w-1/2'>
                            <InputNumber value={appInfo && appInfo.maxMintAmountPerTx} onChange={value => { setAppInfo({ ...appInfo, maxMintAmountPerTx: value }); }} min={0} />
                            <Button onClick={changeMintAmount}>{loading ? <LoadingOutlined /> : <SaveOutlined />}</Button>
                        </div>
                    </div>
                    <div className="flex flex-row items-center mx-5 mb-2">
                        <div className='flex flex-row items-center justify-end w-1/2 mr-10'>
                            <span className='text-[22px]'>Mint Cost for Doll:</span>
                        </div>
                        <div className='flex flex-row items-center w-1/2'>
                            <InputNumber value={appInfo && appInfo.mintCost} onChange={value => { setAppInfo({ ...appInfo, mintCost: value }); }} min={0} />
                            <Button onClick={changeMintCost}>{loading ? <LoadingOutlined /> : <SaveOutlined />}</Button>
                        </div>
                    </div>
                    <div className="flex flex-row items-center mb-2">
                        <div className='w-1/3'>
                            <span className='text-[22px]'></span>
                        </div>
                        <div className='w-2/3'></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;