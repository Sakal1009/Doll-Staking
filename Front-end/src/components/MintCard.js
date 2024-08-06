import { useState } from 'react';
import { InputNumber, Button, Divider, Tooltip } from "antd";
import { DoubleRightOutlined, LoadingOutlined } from '@ant-design/icons';
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import stakingContract from "../artifacts/DollNFTStaking.sol/DollNFTStaking.json";
import nftContract from "../artifacts/DollNFT.sol/DollNFT.json";
import { stakingContractAddress, nftContractAddress, ownerAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const MintCard = (props) => {
    const data = useSelector((state) => state.blockchain.value);
    const [number, setNumber] = useState(0);
    const [loading, setLoading] = useState(false);

    const mint = async () => {
        if (number < 1 || number > props.maxMintAmountPerTx) {
            window.alert('Please type mint amount.');
            return;
        }
        if (data.network === networksMap[networkDeployedTo] && props.paused === 2) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner();
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                if (data.account === ownerAddress) {
                    const mint_tx = await nft_contract.mint(number);
                    await mint_tx.wait();
                } else {
                    const totalMintCost = ethers.utils.parseEther(String(props.mintCost * number), "ether");
                    const mint_tx = await nft_contract.mint(number, { value: totalMintCost });
                    await mint_tx.wait();
                }
                setLoading(false);
                setNumber(0);
                window.alert('Mint Success!');
                props.getInfo();
            } catch (err) {
                setLoading(false);
                window.alert("An error has occured. Please Try Again.");
                console.log(err);
            }
        }
    };

    const stakeDoll = async (id) => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true);
                let provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
                let signer = provider.getSigner();
                let nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                let staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const approve_tx = await nft_contract.approve(stakingContractAddress, id);
                await approve_tx.wait();

                let stake_tx = await staking_contract.stake([id]);
                await stake_tx.wait();
                setLoading(false);
                window.alert('Staking success!');
                props.getInfo();
            } catch (err) {
                setLoading(false);
                window.alert("An error has occured. Please Try Again.");
                // console.log(err);
            }
        }
    };

    return (
        <div className="mx-3 my-3 rounded-[5px] border-[1px] border-gray-600 ">
            <div className='flex flex-row justify-center'>
                <span className="text-[22px] italic bg-fuchsia-600 bg-gradient-to-r from-lime-600 mt-4 px-3 py-1">Let's go Our Travel with Doll! Please stake Dolls</span>
            </div>
            <div className='flex flex-row items-center justify-center mt-3'>
                <span className='mr-3'>amount: </span>
                <Tooltip title={'max: ' + props.maxMintAmountPerTx} color='red'>
                    <InputNumber className='mr-20 ring-1 ring-cyan-100 bg-gradient-to-bl bg-slate-200' value={number} onChange={val => { setNumber(val); }} min={0} max={props.maxMintPerTx} />
                </Tooltip>
                <Button
                    className='transition duration-300 ease-in-out shadow-2xl outline-1 outline-gray-600 hover:outline-double hover:outline-2 hover:outline-green-600 shadow-amber-950 hover:translate-x-1 hover:bg-indigo-700 hover:scale-130 ring-2'
                    onClick={() => { mint(); }}
                >
                    {loading && <LoadingOutlined />}
                    Mint
                    <DoubleRightOutlined />
                </Button>
            </div>
            <Divider />
            <div className='flex flex-row overflow-x-auto'>
                {
                    props.dollList && props.dollList.map((doll, index) => (
                        <div className='flex flex-col m-3 rounded-[20px] items-center' key={index}>
                            <img src={doll.uri} alt="" className='w-50 h-50 mb-3 border-[2px] border-gray-700' />
                            {/* <span>{doll.id}</span> */}
                            {
                                props.stakedDolls && props.stakedDolls.find(x => x === doll.id) !== undefined ? (
                                    <Tooltip title="staked">
                                        <img alt="staked" src="assets/img/bitcoin-wallet.png" className='w-7 h-7 hover:scale-150' />
                                    </Tooltip>
                                ) : <Button className="hover:bg-neutral-500" onClick={() => { stakeDoll(doll.id); }}>{loading && <LoadingOutlined />}stake</Button>
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default MintCard;