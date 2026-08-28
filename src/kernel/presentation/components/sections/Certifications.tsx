import Container from "../shared/Container.tsx";
import {GrCertificate} from "react-icons/gr";
import {FaExternalLinkAlt} from "react-icons/fa";
import info from "../../data/user_info.json";

function Certifications() {
    return (
        <div className="">
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <GrCertificate className="dark:text-primary"/>
                        <h3 className="title">Certifications</h3>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2 h-80 overflow-y-scroll pt-2">
                    {info.certificates?.map((social, index) =>
                        (
                            <a href={social.link} target="_blank" rel="noreferrer" key={social.title}>
                                <div id={`${index}`} key={social.title}
                                     className="flex items-center justify-between dark:bg-gray-500/10 bg-black/10 p-2 rounded-xl hover:-translate-y-0.5 transition-all ease-in-out cursor-pointer border-[0.5px] border-black/10 hover:border-primary hover:ease-in-out hover:delay-200"
                                >
                                    <div className="w-[90%]">
                                        <h3 className="text-base">
                                            {social.title}
                                        </h3>
                                        <p className="text-xs dark:text-white/40 text-black/40 mt-1">
                                            {social.description}
                                        </p>
                                    </div>
                                    <div>
                                        <FaExternalLinkAlt size={13} className="text-gray-400 dark:hover:text-primary"/>
                                    </div>
                                </div>
                            </a>
                        )
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Certifications;
