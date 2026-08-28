import {Link} from "react-router-dom";
import {ArrowLeft, CalendarDays, Clock, PenLine,} from "lucide-react";
import {getAllPosts} from "../utils/blog";
import ToggleTheme from "../../ToggleTheme.tsx";
import type {ToggleThemeProps} from "../../types.ts";

function BlogIndexPage({switchTheme}: ToggleThemeProps) {
    const posts = getAllPosts();

    return (

        <div className="space-y-6 md:w-200 mx-auto">
            <div className=" border-b border-b-gray-600  py-8 backdrop-blur-sm">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:dark:text-foreground hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>
                <div className="flex items-start justify-between mt-4">

                <h2 className="flex items-center gap-3 font-display text-3xl font-bold dark:text-foreground w-full">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <PenLine className="h-5 w-5"/>
                  </span>
                    Blogs
                </h2>

                    <ToggleTheme switchTheme={switchTheme}/>
                </div>

                <p className="mt-3 max-w-xl text-muted-foreground">
                    Thoughts, tutorials, and notes on AI, engineering, and building things.
                </p>
            </div>

            <div className="space-y-4">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        to={`/blog/${post.slug}`}
                        params={{slug: post.slug}}
                        className="block rounded-2xl border border-gray-600 dark:bg-card/80 bg-card/20 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_50px_-20px_var(--color-glow)]"
                    >
                        <h2 className="font-display text-xl font-semibold dark:text-foreground">
                            {post.title}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed dark:text-muted-foreground">
                            {post.excerpt}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs dark:text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 dark:text-primary"/>
                  {post.date}
              </span>

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
                    </Link>
                ))}
            </div>
        </div>

    );
}

export default BlogIndexPage;
