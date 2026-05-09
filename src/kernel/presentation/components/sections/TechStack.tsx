import Container from "../shared/Container.tsx";
import {FaTools} from "react-icons/fa";
import ProgramLang from "./ProgramLang.tsx";
import BackendTech from "./BackendTech.tsx";
import FrontedTech from "./FrontedTech.tsx";
import DevOpsOrCloud from "./DevOpsOrCloud.tsx";
import ToolsAndTech from "./ToolsAndTech.tsx";

function TechStack() {
    return (
        <Container>
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaTools />
                        <h3 className="title">Tech Stack</h3>
                    </div>
                </div>
                <div className="flex flex-col gap-2 mt-2 h-[20.5rem] overflow-y-scroll">
                    <ProgramLang/>
                    <BackendTech/>
                    <FrontedTech/>
                    <DevOpsOrCloud/>
                    <ToolsAndTech/>
                </div>
            </div>
        </Container>
    );
}

export default TechStack;
