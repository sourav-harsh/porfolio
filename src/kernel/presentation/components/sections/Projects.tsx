import Container from "../shared/Container.tsx";
import {FaTools} from "react-icons/fa";
import ProgramLang from "./ProgramLang.tsx";
import BackendTech from "./BackendTech.tsx";
import FrontedTech from "./FrontedTech.tsx";
import DevOpsOrCloud from "./DevOpsOrCloud.tsx";

function Projects() {
    return (
        <Container>
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaTools />
                        <h3 className="title">Projects</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <button className="btn">View All</button>
                    </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <ProgramLang/>
                    <BackendTech/>
                    <FrontedTech/>
                    <DevOpsOrCloud/>
                </div>
            </div>
        </Container>
    );
}

export default Projects;
