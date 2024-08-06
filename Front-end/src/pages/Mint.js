import { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import axios from "axios";
import stakingContract from "../artifacts/DollNFTStaking.sol/DollNFTStaking.json";
import nftContract from "../artifacts/DollNFT.sol/DollNFT.json";
import ftContract from "../artifacts/DollFT.sol/DollFT.json";
import { stakingContractAddress, nftContractAddress, tokenContractAddress, ownerAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";
import DollInfoCard from "../components/DollInfoCard";
import MintCard from '../components/MintCard';
import WalletInfo from "../components/WalletInfo";

const Mint = () => {
    const data = useSelector((state) => state.blockchain.value);
    const [userNfts, setUserNfts] = useState([]);
    const [info, setInfo] = useState({
        currentSupply: 0,
        maxSupply: 0,
        maxMintAmountPerTx: 5,
        mintCost: 0,
        paused: 1,
        userNftIds: [],
        stakedNftIds: [],
        totalReward: 0
    });

    const getInfo = async () => {
        try {
            if (data.network === networksMap[networkDeployedTo]) {
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider);
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, provider);
                const ft_contract = new ethers.Contract(tokenContractAddress, ftContract.abi, provider);

                const signer = provider.getSigner();
                const user = await signer.getAddress();
                const stakedTokens = Array.from((await staking_contract.tokensOfOwner(user)), x => Number(x));
                const reward = await staking_contract.getTotalRewardEarned(user);

                const userFeather = await ft_contract.balanceOf(user);

                const paused = await nft_contract.paused();
                var userTokens = Array.from((await nft_contract.tokensOfOwner(user)), x => Number(x));
                const maxMintAmountPerTx = await nft_contract.maxMintAmountPerTx();
                const cost = await nft_contract.cost();
                const baseURI = await nft_contract.baseURI();
                const baseExtension = await nft_contract.BASE_EXTENSION();
                const totalSupply = await nft_contract.totalSupply();
                const maxSupply = await nft_contract.maxSupply();

                userTokens = userTokens.concat(stakedTokens).sort();

                setInfo({
                    currentSupply: Number(totalSupply),
                    maxSupply: Number(maxSupply),
                    maxMintAmountPerTx: Number(maxMintAmountPerTx),
                    mintCost: Number(ethers.utils.formatUnits(cost, "ether")),
                    paused: Number(paused),
                    userNftIds: userTokens,
                    userFeather: Number(ethers.utils.formatUnits(userFeather, "ether")),
                    stakedNftIds: stakedTokens,
                    totalReward: Number(ethers.utils.formatUnits(reward, "ether"))
                });

                const _userNfts = await Promise.all(userTokens.map(async (nft) => {
                    const metadata = await axios.get(
                        baseURI.replace("ipfs://", "https://ipfs.io/ipfs/") + "/" + nft.toString() + baseExtension
                    );
                    return {
                        id: nft,
                        uri: metadata.data.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                    };
                }))
                setUserNfts(_userNfts);
            }
        } catch (err) {
            window.alert("An error has occured.");
            console.log(err);
        }
    };

    useEffect(() => {
        getInfo()
    }, [data.account]);

    return (
        <div className="flex flex-col items-center">
            <DollInfoCard currentSupply={info.currentSupply} maxSupply={info.maxSupply} maxMintAmountPerTx={info.maxMintAmountPerTx} />
            <Row className='w-full'>
                <Col span={10}>
                    <WalletInfo
                        reward={info.totalReward}
                        myDolls={info.userNftIds}
                        stakedDolls={info.stakedNftIds}
                        userDollList={userNfts}
                        feather={info.userFeather}
                        getInfo={getInfo}
                    />
                </Col>
                <Col span={14}>
                    <MintCard
                        paused={info.paused}
                        mintCost={info.mintCost}
                        getInfo={getInfo}
                        dollList={userNfts}
                        stakedDolls={info.stakedNftIds}
                        maxMintAmountPerTx={info.maxMintAmountPerTx}
                    />
                </Col>
            </Row>
        </div >
    );
};

export default Mint;