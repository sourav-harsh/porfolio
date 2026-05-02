import {PiBuildingOfficeDuotone} from "react-icons/pi";
import Container from "../shared/Container.tsx";
import info from "../../data/user_info.json";


function Expirence() {
    return (
        <Container>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PiBuildingOfficeDuotone/>
                    <h3 className="title">Experience</h3>
                </div>
            </div>
            <div className="mt-2 flex flex-col gap-4 pl-1.5 w-full h-28 overflow-y-scroll">

                <div className="flex gap-4">
                    <div className="w-[0.5px] rounded-xl dark:bg-gray-300/30 bg-gray-800"></div>
                    <div className="flex flex-col gap-4 w-full">
                        {info.experience?.map((exp, i) => (
                            <div className="flex items-start justify-between" id={`${exp.company}-${i}`} key={`${exp.company}-${i}-${exp.year}`}>
                                <div>
                                    <div className="relative">
                                        <div
                                            className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 rounded-full dark:bg-gray-300/60 bg-gray-800"></div>
                                        <h3>{exp.position}</h3>
                                    </div>
                                    <h3>{exp.company}</h3>
                                </div>
                                <div className="text-gray-300 text-xs font-mono">{exp.year}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Expirence;
