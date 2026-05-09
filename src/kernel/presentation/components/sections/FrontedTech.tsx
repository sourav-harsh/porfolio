import ShineContainer from "../shared/ShineContainer.tsx";
import {FaVuejs} from "react-icons/fa";
import {RiNextjsFill, RiReactjsFill} from "react-icons/ri";
import {SiStorybook, SiTailwindcss, SiVite, SiVitest} from "react-icons/si";

function FrontedTech() {
    return (
        <div>
            <h3 className="text-base font-bold">Frontend Development</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <ShineContainer classes="flex items-center gap-2">
                    <RiReactjsFill/>
                    ReactJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <RiNextjsFill />
                    NextJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaVuejs/>
                    VueJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiVite />
                    Vite
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiTailwindcss/>
                    TailwindCSS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiStorybook/>
                    StoryBook
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiVitest/>
                    Vitest
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <RiReactjsFill/>
                    ReactNative
                </ShineContainer>

            </div>
        </div>
    );
}

export default FrontedTech;
