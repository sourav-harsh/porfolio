import type {MyComponentProps} from "../types.ts";
import Footer from "../sections/Footer.tsx";
import ToggleTheme from "../ToggleTheme.tsx";
import { FaArrowLeft } from "react-icons/fa";

function Overlay({children, switchTheme }: MyComponentProps) {
    return (
        <div className="fixed inset-0 top-0 left-0 w-full h-full bg-black/50">
            <div className="border-b border-b-white/50 mx-[50rem] flex items-center justify-between">
                <FaArrowLeft className="transform transition-transform duration-300 hover:scale-125" />
                <ToggleTheme switchTheme={switchTheme as () => void}/>
            </div>
            {children}
            <Footer/>
        </div>
    );
}

export default Overlay;
