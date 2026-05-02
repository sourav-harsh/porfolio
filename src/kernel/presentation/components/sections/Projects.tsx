import Container from "../shared/Container.tsx";
import {PiCaretRight, PiProjectorScreenDuotone} from "react-icons/pi";
import info from "../../data/user_info.json";

function Projects() {
    return (
        <div className="">
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <PiProjectorScreenDuotone/>
                        <h3 className="title">Projects</h3>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2 h-[22.6rem] overflow-y-scroll">
                    {info.projects?.map((project, index) =>
                        (
                            <a href={project.link} target="_blank" rel="noreferrer" key={project.title}>
                                <div id={`${index}`} key={project.title}
                                     className="flex items-center justify-between bg-white/10 p-2 rounded-lg hover:-translate-y-1 transition-all ease-in-out cursor-pointer"
                                >
                                    <div className="">
                                        <h3 className="text-base">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs text-white/40">
                                            {project.description}
                                        </p>
                                    </div>
                                    <PiCaretRight/>
                                </div>
                            </a>
                        )
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Projects;
