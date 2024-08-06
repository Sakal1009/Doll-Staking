import { useEffect, useState } from 'react';
import { List, Avatar, Button, Divider, Tooltip } from 'antd';
import { SketchOutlined, DisconnectOutlined, LoadingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import stakingContract from "../artifacts/DollNFTStaking.sol/DollNFTStaking.json";
import { stakingContractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const WalletInfo = (props) => {
    const data = useSelector((state) => state.blockchain.value);
    const [dollList, setDollList] = useState([]);
    // const [selectedList, setSelectedList] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (props.stakedDolls && props.stakedDolls.length > 0) {
            let temp = props.stakedDolls.map(doll => {
                return { id: doll, checked: false };
            });
            setDollList(temp);
        }
        else setDollList([]);
    }, [props.stakedDolls, loading]);

    const claim = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner();
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const claim_tx = await staking_contract.claim(props.stakedDolls);
                await claim_tx.wait();

                setLoading(false);
                window.alert('Claim success!');
                props.getInfo();
            } catch (error) {
                setLoading(false);
                window.alert("An error has occured. Please Try Again.");
                console.log(error);
            }
        }
    };

    const unstakeAll = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner();
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const unstake_tx = await staking_contract.unstake(props.stakedDolls);
                await unstake_tx.wait()

                setLoading(false);
                window.alert('Unstaking success!');
                props.getInfo();
            } catch (error) {
                setLoading(false);
                window.alert("An error has occured. Please Try Again.");
                console.log(error);
            }
        }
    };

    return (
        <div className='bg-zinc-400 bg-gradient-to-br from-red-200 rounded-[5px] w-2/3 ml-20 my-3 p-3'>
            <Tooltip title="total feathers">
                <div className='flex flex-row items-center justify-end'>
                    <img src="assets/img/feather.svg" alt="" className="w-5 h-5 mr-2" />
                    <span className='text-[15px] tabular-nums'>{props.feather}</span>
                </div>
            </Tooltip>
            <Divider />
            <span className='text-[25px] underline decoration-solid'>My Staked Dolls:</span>
            <div className=''>
                {
                    dollList ? (
                        <List itemLayout='horizontal'
                            className='max-h-[300px] overflow-y-scroll scroll-py-2 scroll-smooth'
                            dataSource={dollList}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <div className='flex flex-row items-center'>
                                                <Avatar src={props.userDollList[index] && props.userDollList[index].uri} size={70} className='mr-5 border-[2px] border-gray-700' />
                                                <span className='text-[25px] w-[200px]'>{item.id}</span>
                                            </div>
                                        }
                                    >
                                    </List.Item.Meta>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <span>Empty!</span>
                    )
                }
            </div>
            <Divider />
            <div>
                <span className='text-[25px]'>Reward: </span>
                <span className='text-[25px] animate-pulse duration-10000 bg-cyan-300 px-1'>{props.reward}</span>
            </div>
            <div className='flex flex-row mt-3 mb-3 justify-evenly'>
                <Button
                    className='w-[80px] ring ring-offset-2 ring-yellow-600 hover:ring-yellow-600 hover:ring-offset-4'
                    type="dashed"
                    onClick={() => { claim(); }}
                    disabled={!(props.stakedDolls.length > 0)}
                >
                    {loading ? <LoadingOutlined /> : <SketchOutlined />}
                    Claim
                </Button>
                <Button className='w-[110px] ring ring-offset-2 hover:ring-offset-4' type="primary" onClick={unstakeAll} disabled={!(props.stakedDolls.length > 0)}>
                    {loading ? <LoadingOutlined /> : <DisconnectOutlined />} Unstake All
                </Button>
            </div>
        </div>
    );
};

export default WalletInfo;