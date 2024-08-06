const OurGameList = () => {
    return (
        <div className="flex flex-wrap justify-center bg-red-300 pt-3 pb-3 py-5">
            <img src="assets/img/1.png" alt="1" className="visible w-[200px] h-[200px]" />
            <img src="assets/img/2.png" alt="2" className="w-[200px] h-[200px] visible" />
            <img src="assets/img/3.png" alt="3" className="w-[200px] h-[200px] visible" />
            <img src="assets/img/4.png" alt="4" className="w-[200px] h-[200px] visible" />
            <img src="assets/img/5.png" alt="5" className="w-[200px] h-[200px] visible" />
            <img src="assets/img/6.png" alt="6" className="w-[200px] h-[200px] visible" />
        </div>
    );
};

export default OurGameList;