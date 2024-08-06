const DollInfoCard = (props) => {
    return (
        <div className="border-[3px] border-x-slate-600 px-4 py-5 m-2 bg-yellow-100 w-1/2 rounded-[2px] bg-gradient-to-r from-indigo-500">
            <div className="mt-3">
                <table className="table-auto w-full">
                    <caption className="cattion-top border-b-gray-600 border-b-[1px] flex flex-row justify-center items-center mb-2">
                        <span className="text-[35px] font-thin italic mr-5">
                            Doll Information
                        </span>
                        <img src="assets/img/poster.png" alt="posterImg" className="w-[40px] h-[40px]" />
                    </caption>
                    <thead>
                    </thead>
                    <tbody>
                        <tr className="border-separate border border-gray-800">
                            <td className="border-separate border border-gray-800 w-2/3">
                                <span className="text-[28px]">Current Number of Dolls:</span>
                            </td>
                            <td className="border-separate border border-gray-800">
                                <span className="text-[28px]">{props.currentSupply}</span>
                            </td>
                        </tr>
                        <tr className="border-separate border border-gray-800">
                            <td className="border-separate border border-gray-800  w-2/3">
                                <span className="text-[28px]">Max Number of Dolls:</span>
                            </td>
                            <td className="border-separate border border-gray-800">
                                <span className="text-[28px]">{props.maxSupply}</span>
                            </td>
                        </tr>
                        <tr className="border-separate border border-gray-800">
                            <td className="border-separate border border-gray-800  w-2/3">
                                <span className="text-[28px]">Max Mint Amount per Tx:</span>
                            </td>
                            <td className="border-separate border border-gray-800">
                                <span className="text-[28px]">{props.maxMintAmountPerTx}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default DollInfoCard;