import type {MyComponentProps} from "../types.ts";

function ShineContainer({children ,classes}: MyComponentProps) {

    return (
        <div
            className={`group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-full shadow-lg py-1 px-1.5 overflow-hidden cursor-pointer text-xs ${classes}`}
        >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
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
