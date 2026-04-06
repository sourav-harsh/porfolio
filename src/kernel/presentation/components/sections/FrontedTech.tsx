import ShineContainer from "../shared/ShineContainer.tsx";
import {FaJava} from "react-icons/fa";
import {BsJavascript} from "react-icons/bs";

function FrontedTech() {
    return (
        <div>
            <h3 className="text-base font-bold">Frontend Development</h3>
            <div className="flex flex-wrap gap-2 mt-1">
                <ShineContainer classes="flex items-center gap-2">
                    <FaJava/>
                    ReactJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    VueJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    TailwindCSS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    StoryBook
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    Vitest
                </ShineContainer>

            </div>
        </div>
    );
}

export default FrontedTech;
