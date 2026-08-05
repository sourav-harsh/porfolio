import {DiMongodb} from "react-icons/di";
import ShineContainer from "../shared/ShineContainer.tsx";
import {FaDatabase, FaNodeJs} from "react-icons/fa";
import {
    SiApachekafka,
    SiExpress, SiFastapi,
    SiJunit5,
    SiMinio,
    SiNeo4J,
    SiPostgresql,
    SiQuarkus,
    SiRedis,
    SiSocketdotio,
    SiSpring,
    SiSpringboot
} from "react-icons/si";
import {GrMysql} from "react-icons/gr";
import {CiMicrochip} from "react-icons/ci";
import {VscMcp} from "react-icons/vsc";

function BackendTech() {
    return (
        <div>
            <h3 className="text-base font-bold">Backend Development</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <ShineContainer classes="flex items-center gap-2">
                    <SiQuarkus />
                    Quarkus
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiSpringboot />
                    SpringBoot
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaNodeJs />
                    NodeJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiApachekafka />
                    Kafka
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiExpress />
                    ExpressJS
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiJunit5 />
                    JUnit
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <DiMongodb />
                    MongoDB
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <FaDatabase />
                    DynamoDB
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <GrMysql />
                    MySQL
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiPostgresql />
                    PostgreSQL
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiSocketdotio />
                    SocketIo
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiSpring />
                    SpringAi
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiRedis />
                    Redis
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiFastapi />
                    FastAPI
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <CiMicrochip />
                    Microservices
                </ShineContainer>

                <ShineContainer classes="flex items-center gap-2">
                    <VscMcp />
                    MCP
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiNeo4J />
                    Neo4J
                </ShineContainer>
                <ShineContainer classes="flex items-center gap-2">
                    <SiMinio />
                    Minio
                </ShineContainer>


            </div>
        </div>
    );
}

export default BackendTech;
