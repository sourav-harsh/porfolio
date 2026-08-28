import info from "../../data/user_info.json";
import {FaUser} from "react-icons/fa";
import Container from "../shared/Container.tsx";

const About = () => {
    return (
        <Container>
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <FaUser color="oklch(0.78 0.13 215)"/>
                    <h2 className="title">About</h2>
                </div>
                <p className="text-sm leading-7.5 text-gray-200/80 font-mono">
                    {info.main.description}
                </p>
            </div>
        </Container>
    );
};

export default About;
