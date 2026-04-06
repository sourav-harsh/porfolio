import ShineContainer from "../shared/ShineContainer.tsx";
import {FaJava} from "react-icons/fa";
import {BsJavascript} from "react-icons/bs";

function DevOpsOrCloud() {
    return (
        <div>
            <h3 className="text-base font-bold">DevOps & Cloud</h3>
            <div className="flex flex-wrap gap-2 mt-1">
                <ShineContainer classes="flex items-center gap-2">
                    <FaJava/>
                    Docker
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    CI/CD
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsJavascript/>
                    AWS
                </ShineContainer>
            </div>
        </div>
    );
}

export default DevOpsOrCloud;
