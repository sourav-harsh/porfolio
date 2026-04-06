import ShineContainer from "../shared/ShineContainer.tsx";
import {FaJava} from "react-icons/fa";
import {BsJavascript} from "react-icons/bs";

function ProgramLang() {
    return (
        <div>
            <h3 className="text-base font-bold">Programing Languages</h3>
            <div className="flex flex-wrap gap-2 mt-1">
                <ShineContainer classes="flex items-center gap-2">
                    <FaJava/>
                    Java
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    JavaScript
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    TypeScript
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    C/C++
                </ShineContainer>

            </div>
        </div>
    );
}

export default ProgramLang;
