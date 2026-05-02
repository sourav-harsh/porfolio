import Container from "../shared/Container.tsx";
import { GrCertificate } from "react-icons/gr";
import {PiCaretRight} from "react-icons/pi";
import info from "../../data/user_info.json";

function Certifications() {
    return (
        <div className="">
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <GrCertificate />
                        <h3 className="title">Certifications</h3>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2 h-80 overflow-y-scroll">
                    {info.certificates?.map((social, index) =>
                        (
                            <a href={social.link} target="_blank" rel="noreferrer" key={social.title}>
                                <div id={`${index}`} key={social.title}
                                     className="flex items-center justify-between bg-white/10 p-2 rounded-lg hover:-translate-y-0.5 transition-all ease-in-out cursor-pointer"
                                >
                                    <div className="">
                                        <h3 className="text-base">
                                            {social.title}
                                        </h3>
                                        <p className="text-xs text-white/40">
                                            {social.description}
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

export default Certifications;
