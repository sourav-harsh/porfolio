import Container from "../shared/Container.tsx";
import info from "../../data/user_info.json";
import {GiPostOffice} from "react-icons/gi";


function Expirence() {
    return (
        <Container>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GiPostOffice />
                    <h3 className="title">Education</h3>
                </div>
            </div>
            <div className="mt-2 flex flex-col gap-4">

                <div className="flex gap-4">
                    <div className="w-[0.5px] rounded-xl bg-gray-300/30"></div>
                    <div className="flex flex-col gap-4 w-full">
                        {info.education?.map(exp => (
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="relative text-sm">
                                        <div className="absolute -left-[1.37rem] top-1.5 w-3 h-3 rounded-full bg-gray-300/60"></div>
                                        <h3>{exp.school}</h3>
                                    </div>
                                    <h4 className="text-xs">{exp.degree}</h4>
                                </div>
                                <div className="text-gray-300 text-xs font-mono">{exp.duration}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Expirence;
