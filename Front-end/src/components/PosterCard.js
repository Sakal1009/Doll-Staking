const PosterCard = () => {
    return (
        <div className="w-full h-[500px] bg-zinc-50">
            <div className="text-center">
                <span className="font-sans text-[70px] italic text-indigo-700 animate-pulse duration-1000">
                    Please stake Doll!
                </span>
            </div>
            <div className="grid grid-cols-2">
                <div className="p-20">
                    <span className="font-serif text-[32px] text-black">
                        When you stake <b>Dolls</b>, you are rewarded with <b className="text-blue-700">Feathers</b> depending on the staking period.<br />
                        <b className="text-blue-700">Feathers</b> can be used to purchase equipment in our AI Games.
                    </span>
                </div>
                <div className="flex flex-row items-center justify-start bg-move">
                    <img src="assets/img/poster.png" alt="posterImg" className="-rotate-45 animate-pulse duration-3000" />
                    <img src="assets/img/poster.png" alt="posterImg" className="animate-pulse duration-3000" />
                    <img src="assets/img/poster.png" alt="posterImg" className="rotate-45 animate-pulse duration-3000" />
                </div>
            </div>
        </div >
    );
};

export default PosterCard;