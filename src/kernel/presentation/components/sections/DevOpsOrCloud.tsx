import ShineContainer from "../shared/ShineContainer.tsx";
import {FaAws, FaDocker} from "react-icons/fa";
import {BsInfinity} from "react-icons/bs";
import {SiKubernetes} from "react-icons/si";

function DevOpsOrCloud() {
    return (
        <div>
            <h3 className="text-base font-bold">DevOps & Cloud</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <ShineContainer classes="flex items-center gap-2">
                    <FaDocker />
                    Docker
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <BsInfinity />
                    CI/CD
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaAws />
                    AWS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiKubernetes />
                    Kubernetes
                </ShineContainer>
            </div>
        </div>
    );
}

export default DevOpsOrCloud;
