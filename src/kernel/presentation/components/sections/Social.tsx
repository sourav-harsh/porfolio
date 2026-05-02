import Container from "../shared/Container.tsx";
import {IoShareSocialSharp} from "react-icons/io5";
import {PiCaretRight} from "react-icons/pi";
import info from "../../data/user_info.json";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { TbBrandLeetcode } from "react-icons/tb";

function Social() {
    return (
        <div className="h-full">
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <IoShareSocialSharp/>
                        <h3 className="title">Social</h3>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2 overflow-y-scroll h-full">
                    {info.socials?.map((social,index) =>
                        (
                            <a id={`${index}`} key={social.title} href={social.url}
                               className="flex items-center justify-between bg-white/10 p-2 rounded-lg hover:translate-x-2 transition-all ease-in-out cursor-pointer"
                               target="_blank"
                            >
                                <div className="flex items-center gap-2">
                                    {social.title==='X'?<FaXTwitter/>:social.title==='LinkedIn'?<FaLinkedin/>:social.title==='GitHub'?<FaGithub/>:social.title==='LeetCode'?<TbBrandLeetcode/>:null}
                                    {social.title}
                                </div>
                                <PiCaretRight/>
                            </a>
                        )
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Social;
