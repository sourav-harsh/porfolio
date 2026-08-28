import { FaRegCopyright } from "react-icons/fa";
import { Link } from "react-router-dom";
import info from "../../data/user_info.json";

function Footer() {
    return (
        <div className="border-t dark:border-t-white/60 border-t-black/60 md:w-200 mx-auto mt-5 pt-5 dark:text-white/60 text-black md:text-xs text-[0.55rem]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <FaRegCopyright />
                    <div>{new Date().getFullYear()} {info.footer}</div>
                </div>
                <div className="flex items-center gap-2">
                   <Link to="/blogs" className="hover:text-primary" >
                       Blogs
                   </Link>
                    <Link to="/" className="hover:text-primary" >
                       Home
                   </Link>
                </div>
            </div>
        </div>
    );
}

export default Footer;
