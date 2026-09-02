import {useContext} from "react";
import Hero from "../kernel/presentation/components/sections/Hero.tsx";
import {AppContext} from "../kernel/core/AppContext.tsx";

import Blogs from "../kernel/presentation/components/sections/Blogs.tsx";
import Container from "../kernel/presentation/components/shared/Container.tsx";
import Social from "../kernel/presentation/components/sections/Social.tsx";
import Expirence from "../kernel/presentation/components/sections/Expirence.tsx";
import Education from "../kernel/presentation/components/sections/Education.tsx";
import TechStack from "../kernel/presentation/components/sections/TechStack.tsx";
import GithubContributionGrid from "../kernel/presentation/components/sections/GithubContributionGrid.tsx";
import Certifications from "../kernel/presentation/components/sections/Certifications.tsx";
import Projects from "../kernel/presentation/components/sections/Projects.tsx";

function Homepage() {
    const {theme, switchTheme} = useContext(AppContext);




    return (
        <>
            <div>
                <div className="w-full">
                    <div className="md:flex md:items-center md:justify-center w-full">
                        <div className="md:w-[60rem] h-full rounded-2xl">
                            <div
                                className="md:grid md:grid-cols-2 md:gap-3.5 md:items-stretch md:justify-stretch dark:text-white text-black">
                                <div className="col-span-2 row-span-2">
                                    <Hero switchTheme={switchTheme} theme={theme}/>
                                </div>
                                <div className="md:col-span-1 md:row-span-4 flex flex-col gap-3.5 h-full md:mt-0 mt-2">
                                    <TechStack/>
                                    <Projects/>
                                    <div className="md:inline hidden">
                                        <Blogs/>
                                    </div>
                                </div>
                                <div className="md:col-span-1 md:row-span-4 flex flex-col gap-3.5 h-full md:mt-0 mt-2">
                                    <Expirence/>
                                    <Education/>
                                    <Certifications/>
                                    <div className="md:hidden mt-2">
                                        <Blogs/>
                                    </div>
                                    <Social/>
                                </div>

                            </div>
                            <div className="mt-2">
                                <Container>
                                    <GithubContributionGrid username="sourav-harsh"/>
                                </Container>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Homepage;
