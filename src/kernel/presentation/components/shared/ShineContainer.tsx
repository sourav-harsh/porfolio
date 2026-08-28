import type {MyComponentProps} from "../types.ts";

function ShineContainer({children ,classes}: MyComponentProps) {

    return (
        <div
            className={`group relative backdrop-blur-xl dark:bg-gray-400/10  border dark:border-gray-200/20 dark:hover:border-primary dark:hover:bg-primary/20 border-black/20 rounded-full shadow-lg py-1 px-1.5 overflow-hidden cursor-pointer text-xs ${classes}`}
        >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b dark:from-white/10 from-black/30 to-transparent"></div>
            <div
                className="group-hover:inline hidden absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-45 animate-shine delay-1000 duration-1000"
                style={{
                    width: "300%",
                    height: "300%",
                    top: "-150%",
                    left: "-150%",
                }}
                id={children?.toLocaleString()}
            ></div>
            {children}
        </div>
    );
}

export default ShineContainer;
