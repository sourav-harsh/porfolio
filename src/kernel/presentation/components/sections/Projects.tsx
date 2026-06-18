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
                <div className="mt-2 flex flex-col gap-3 h-[22.6rem] overflow-y-scroll">
                    {info.projects?.map((project, index) =>
                        (

                            <div id={`${index}`} key={project.title}
                                 className="flex items-center justify-between dark:bg-white/10 bg-black/10 p-2 rounded-lg hover:-translate-y-1 transition-all ease-in-out"
                            >
                                <div className="">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex items-center gap-0.5 text-[0.7rem] font-light hover:translate-x-1 ${project.isRepoDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                                <a href={project.github} target="_blank">
                                                    Repository
                                                </a>
                                                <PiCaretRight/>
                                            </div>
                                            <div
                                                className={`flex items-center gap-0.5 text-[0.7rem] font-light hover:translate-x-1 ${project.isDemoDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                                <a href={project.link} target="_blank">
                                                    Demo
                                                </a>
                                                <PiCaretRight/>
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
