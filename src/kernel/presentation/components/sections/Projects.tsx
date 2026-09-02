import Container from "../shared/Container.tsx";
import { PiProjectorScreenDuotone} from "react-icons/pi";
import { FiGithub } from "react-icons/fi";
import info from "../../data/user_info.json";
import {FaExternalLinkAlt} from "react-icons/fa";

function Projects() {
    return (
        <div className="">
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <PiProjectorScreenDuotone className="dark:text-primary" />
                        <h3 className="title">Projects</h3>
                        <h4>({info.projects?.length})</h4>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-3 h-[22.6rem] overflow-y-scroll pt-2 no-scrollbar">
                    {info.projects?.map((project, index) =>
                        (

                            <div id={`${index}`} key={project.title}
                                 className="flex items-center justify-between dark:bg-gray-500/10 bg-black/10 p-2 rounded-lg hover:-translate-y-1 transition-all ease-in-out border border-black/10 dark:border-white/10 hover:border-primary"
                            >
                                <div className="">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex items-center gap-0.5 text-[0.7rem] font-light hover:text-primary ${project.isRepoDisabled ? 'hidden' : ''}`}>
                                                <a href={project.github} target="_blank">
                                                <FiGithub size={15}  />
                                                </a>
                                            </div>
                                            <div
                                                className={`flex items-center gap-0.5 text-[0.7rem] font-light ${project.isDemoDisabled ? 'hidden' : ''}`}>
                                                <a href={project.link} target="_blank">
                                                    <FaExternalLinkAlt size={13}  className="dark:text-gray-400 hover:text-primary"/>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs dark:text-white/40 text-black/40 mt-1">
                                        {project.description}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Projects;
