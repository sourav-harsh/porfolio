import Container from "../shared/Container.tsx";
import {IoShareSocialSharp} from "react-icons/io5";
import {PiCaretRight} from "react-icons/pi";
import info from "../../data/user_info.json";

function Certifications() {
    return (
        <div className="">
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <IoShareSocialSharp/>
                        <h3 className="title">Certifications</h3>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                    {info.certificates?.slice(0,4)?.map((social, index) =>
                        (
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
                        )
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Certifications;
