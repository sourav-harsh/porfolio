import ShineContainer from "../shared/ShineContainer.tsx";
import {FaJava, FaPython} from "react-icons/fa";
import {BsJavascript, BsTypescript} from "react-icons/bs";
import {FaC} from "react-icons/fa6";

function ProgramLang() {
    return (
        <div>
            <h3 className="text-base font-semibold font-mono">Programing Languages</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <ShineContainer classes="flex items-center gap-2">
                    <FaJava/>
                    Java
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    JavaScript
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsTypescript />
                    TypeScript
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaC color='white'/>
                    C/C++
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaPython/>
                    Python
                </ShineContainer>

            </div>
        </div>
    );
}

export default ProgramLang;
