import ToggleTheme from "../ToggleTheme.tsx";
import info from "../../data/user_info.json";
import {IoLocationSharp} from "react-icons/io5";
import {MdOutlineFileDownload, MdVerified} from "react-icons/md";
import {FaGraduationCap} from "react-icons/fa6";
import {BsFiletypePdf} from "react-icons/bs";
import {IoMdMail} from "react-icons/io";
import {TbBrandTelegram} from "react-icons/tb";
import {FaCaretDown} from "react-icons/fa";
import type {ToggleThemeProps} from "../types.ts";
import Container from "../shared/Container.tsx";

const Hero = ({switchTheme}: ToggleThemeProps) => {
    const handleLearningGoal = () => {
        const learningGoalDropdown = document.getElementById("learningGoalDropdown");
        learningGoalDropdown?.classList.toggle("hidden");
    }

    const handleLearningGoalMobileScreen = () => {
        const learningGoalDropdown = document.getElementById("learningGoalDropdownMobileScreen");
        learningGoalDropdown?.classList.toggle("hidden");
    }

    return (
        <Container>
            <div>
                <div className="flex gap-4 w-full">
                    <img src={info.main?.photo} alt="profile pic of sourav" className="w-40 md:h-36 h-40 rounded-xl"/>
                    <div className="w-full dark:text-white text-black">
                        <div className="flex items-start justify-between">
                            <h2 className="md:text-2xl text-lg font-bold flex items-center gap-1">{info.main?.name}
                                <MdVerified color="#3366ff"/></h2>
                            <div className="md:-mt-3 md:static absolute md:-top-5 -top-3 md:-right-5 -right-3">
                                <ToggleTheme switchTheme={switchTheme}/>
                            </div>
                        </div>
                        <p className="md:text-xs text-[11px] font-normal flex items-center gap-1 mt-0.5">
                            <IoLocationSharp className="h-3.5"/>
                            {info.main.location}
                        </p>

                        <div className="flex items-center justify-between mt-5">
                            <p className="md:text-base text-sm">{info.main.role}</p>
                            <button
                                className="px-4 py-1 bg-blue-500 rounded text-xs text-white font-normal md:flex items-center gap-1 relative cursor-pointer  hidden"
                                onClick={handleLearningGoal}>
                                <FaGraduationCap size={18}/>
                                {info.main.learningGoalBtn}
                                <div className="border-l border-l-white pl-3 ml-3"><FaCaretDown/></div>
                                <div className="absolute top-8 right-0 w-60 hidden"
                                     id="learningGoalDropdown">
                                    <div
                                        className="relative">
                                        <div className="z-[99999999] rounded-xl p-5 flex flex-col h-max dark:bg-gray-300 bg-black/50 dark:text-black text-white">

                                            <p className="text-xs font-normal">{info.main.futureLearningSubTitle}</p>
                                            <div>
                                                <ol>
                                                    {info.main.futureLearning?.map((item, index) => (
                                                        <li key={index} className="text-xs font-normal"><p
                                                            className="font-semibold">{item.title}</p> - {item.description}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mt-5">
                            <a className="px-4 md:py-1 py-1.5 bg-white rounded text-xs font-semibold flex items-center gap-1 text-black cursor-pointer group"
                               href={`mailto:${info.main.email}`}><IoMdMail size={18} className="group-hover:hidden"/>
                                <TbBrandTelegram size={18} className="hidden group-hover:inline"/><p
                                    className="md:inline hidden">{info.main.sendMailBtnTxt}</p></a>
                            <a className="px-4 md:py-1.5 py-2.5 dark:bg-gray-400/50 bg-gray-900 text-white  rounded text-xs font-normal flex items-center gap-3 hover:gap-5 ease-in-out transition-all cursor-pointer"
                               href={info.main.resumeLink} target="_blank">
                                <div className="flex items-center gap-1"><BsFiletypePdf/><p
                                    className="md:inline hidden">{info.main.resumeBtnTxt}</p></div>
                                <div className="md:inline hidden"><MdOutlineFileDownload/></div>
                            </a>
                        </div>
                    </div>
                </div>
                <button
                    className="mt-2 dark:text-white text-black px-4 py-1 bg-blue-500 rounded text-xs font-normal flex items-center justify-between relative cursor-pointer w-full  md:hidden"
                    onClick={handleLearningGoalMobileScreen}>
                    <div className="flex items-center gap-1">
                        <FaGraduationCap size={18}/>
                        {info.main.learningGoalBtn}
                    </div>
                    <div className="border-l border-l-white pl-3 ml-3"><FaCaretDown/></div>
                    <div className="absolute top-8 right-0 w-48 h-full bg-black/50 hidden"
                         id="learningGoalDropdownMobileScreen"></div>
                </button>
            </div>
        </Container>
    );
};

export default Hero;
