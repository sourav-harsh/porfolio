import {PiBuildingOfficeDuotone} from "react-icons/pi";
import Container from "../shared/Container.tsx";
import info from "../../data/user_info.json";


function Expirence() {
    return (
        <Container>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PiBuildingOfficeDuotone className="dark:text-primary"/>
                    <h3 className="title uppercase">Experience</h3>
                </div>
            </div>
            <div className="mt-2 flex flex-col gap-4 pl-1.5 w-full h-60 overflow-y-scroll">
                <div className="flex gap-4">
                    <div className="w-[0.8px] rounded-xl dark:bg-gray-300/20 bg-gray-800"></div>
                    <div className="flex flex-col gap-5 w-full">
                        {info.experience?.map((exp, i) => (
                            <>
                                <div className="flex items-start justify-between" id={`${exp.company}-${i}`}
                                     key={`${exp.company}-${i}-${exp.year}`}>
                                    <div>
                                        <div className="relative">
                                            <div
                                                className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 rounded-full dark:bg-primary bg-gray-800"></div>
                                            <h3>{exp.position}</h3>
                                        </div>
                                        <h3 className="dark:text-primary">{exp.company}</h3>
                                    </div>
                                    <div className="dark:text-gray-300 text-xs font-mono">{exp.year}</div>
                                </div>
                                <div className="flex flex-col gap-2 pl-2">
                                    {exp.descriptions.map((desc, i) => (
                                        <div className="flex items-start gap-2">
                                            <div className="w-3 h-1.5 rounded-full dark:bg-primary bg-gray-800 mt-1"></div>
                                            <div key={i} className="dark:text-gray-200/80 text-xs font-mono">{desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Expirence;
