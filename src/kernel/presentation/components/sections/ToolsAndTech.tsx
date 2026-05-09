import ShineContainer from "../shared/ShineContainer.tsx";
import {FaGithub} from "react-icons/fa";
import {SiApachemaven, SiPostman} from "react-icons/si";
import {TbBrandOauth} from "react-icons/tb";
import {BsClaude} from "react-icons/bs";

function ToolsAndTech() {
    return (
        <div>
            <h3 className="text-base font-bold">Tools & Technologies</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <ShineContainer classes="flex items-center gap-2">
                    <SiPostman />
                    Postman
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaGithub />
                    GitHub
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiApachemaven />
                    Maven
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <TbBrandOauth />
                    OAuth
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsClaude />
                    AI
                </ShineContainer>
            </div>
        </div>
    );
}

export default ToolsAndTech;
