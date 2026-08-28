import info from "../../data/user_info.json";
import { LiaBlogSolid } from "react-icons/lia";
import {Link} from "react-router-dom";
import Container from "../shared/Container.tsx";
import {getAllPosts} from "../blogs/utils/blog";
import {FaExternalLinkAlt} from "react-icons/fa";
import {FiGithub} from "react-icons/fi";
import {CalendarDays, Clock} from "lucide-react";

const Blogs = () => {
    const posts = getAllPosts();
    return (
        <Container>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 ">
                        <LiaBlogSolid className="dark:text-primary"/>
                        <h2 className="title uppercase">Blogs</h2>
                    </div>
                    <div className="flex items-center gap-1 group text-xs">
                        <Link to="/blogs" className="dark:text-gray-400 group-hover:text-primary uppercase">All Blogs</Link>
                        <FaExternalLinkAlt size={10} className="dark:text-gray-400 group-hover:text-primary" />
                    </div>
                </div>

             <div className="flex flex-col gap-4">
                 {posts?.map((post, index) =>
                     (

                         <div id={`${index}`} key={post.title}
                              className="flex items-center justify-between dark:bg-gray-500/10 bg-black/10 p-2 rounded-lg hover:-translate-y-1 transition-all ease-in-out border border-black/10 dark:border-white/10 hover:border-primary"
                         >
                             <div className="">
                                 <div className="flex items-center justify-between">
                                     <h3 className="text-base w-[70%]">
                                         {post.title}
                                     </h3>
                                     <span className="inline-flex items-center gap-1.5 text-xs dark:text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5 dark:text-primary"/>
                                         {post.date}
                                    </span>
                                 </div>
                                 <div className="mt-4 flex flex-wrap items-center gap-4 text-xs dark:text-muted-foreground">


                                        <span className="inline-flex items-center gap-1.5">
                                             <Clock className="h-3.5 w-3.5 dark:text-primary"/>
                                            {post.readingTime} min read
                                         </span>
                                     <div className="flex gap-1.5">
                                         {post.tags.map((tag) => (
                                             <span
                                                 key={tag}
                                                 className="rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] text-accent-foreground"
                                             >
                                                      {tag}
                                                </span>
                                         ))}
                                     </div>
                                 </div>
                                 <p className="text-xs dark:text-white/40 text-black/40 mt-1">
                                     {post.excerpt}
                                 </p>
                             </div>
                         </div>
                     )
                 )}
             </div>
            </div>
        </Container>
    );
};

export default Blogs;

