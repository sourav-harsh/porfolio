import ShineContainer from "../shared/ShineContainer.tsx";
import {FaJava} from "react-icons/fa";
import {BsJavascript} from "react-icons/bs";

function BackendTech() {
    return (
        <div>
            <h3 className="text-base font-bold">Backend Development</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <ShineContainer classes="flex items-center gap-2">
                    <FaJava/>
                    Quarkus
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    SpringBoot
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    NodeJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    ExpressJS
                </ShineContainer>

            </div>
        </div>
    );
}

export default BackendTech;
