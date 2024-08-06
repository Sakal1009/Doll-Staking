import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import stakingContract from "../artifacts/DollNFTStaking.sol/DollNFTStaking.json";
import nftContract from "../artifacts/DollNFT.sol/DollNFT.json";
import { stakingContractAddress, nftContractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const StatisticPan = () => {
    const data = useSelector((state) => state.blockchain.value);
    const [info, setInfo] = useState({
        currentSupply: 0,
        maxSupply: 0,
        maxMintAmountPerTx: 5,
        mintCost: 0,
        paused: 1,
        userNftIds: [],
        stakedNftIds: [],
    });

    useEffect(() => {
        getInfo();
    }, [data.account]);

    const getInfo = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider);
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, provider);

                const signer = provider.getSigner();
                const user = await signer.getAddress();
                const stakedTokens = Array.from((await staking_contract.tokensOfOwner(user)), x => Number(x));
                const paused = await nft_contract.callStatic.paused();
                var userTokens = Array.from((await nft_contract.tokensOfOwner(user)), x => Number(x));
                const maxMintAmountPerTx = await nft_contract.maxMintAmountPerTx();
                const cost = await nft_contract.cost();
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
                    stakedNftIds: stakedTokens,
                })
            } catch (error) {
                console.log(error.message)
            }

        }
    }

    return (
        <div className="bg-blue-500 w-full h-[240px] grid grid-cols-3">
            <div className="flex flex-col items-center justify-center">
                <span className="text-white text-[40px] font-thin">
                    count of Minted NFTs:
                </span>
                <span className="text-white text-[50px] font-thin  animate-pulse duration-1000">{info && info.currentSupply}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className="text-white text-[40px] font-thin">
                    Max Mint Amount Per TX:
                </span>
                <span className="text-white text-[50px] font-thin animate-pulse duration-1000">{info && info.maxMintAmountPerTx}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className="text-white text-[40px] font-thin">
                    count of Staked NFTs:
                </span>
                <span className="text-white text-[50px] font-thin animate-pulse duration-1000">{info && info.stakedNftIds && info.stakedNftIds.length}</span>
            </div>
        </div>
    );
};

export default StatisticPan;
