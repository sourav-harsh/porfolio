import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { getPostBySlug } from "../utils/blog";
import Container from "../../shared/Container.tsx";
import ToggleTheme from "../../ToggleTheme.tsx";
import type {ToggleThemeProps} from "../../types.ts";

function BlogPostPage({switchTheme}: ToggleThemeProps) {
    const { slug } = useParams<{ slug: string }>();

    const post = slug ? getPostBySlug(slug) : null;

    if (!post) {
        return (

            <div className="py-20 text-center">
                <h1 className="text-3xl font-bold">
                    Blog post not found
                </h1>

                <Link
                    to="/blogs"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:dark:text-foreground hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to blog
                </Link>
            </div>

        );
    }

    return (
        <article className="mx-auto max-w-5xl flex flex-col gap-4 md:w-240">
            <div className="flex items-start justify-between">
                <Link
                    to="/blogs"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:dark:text-foreground hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to blog
                </Link>
                <div className="-mt-5">

                <ToggleTheme switchTheme={switchTheme}/>
                </div>
            </div>
            <Container>
            <header className="">
                <h1 className="font-display text-4xl font-bold dark:text-foreground">
                    {post.title}
                </h1>

                <p className="mt-4 text-lg text-muted-foreground">
                    {post.excerpt}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {post.date}
                    </span>

                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {post.readingTime} min read
                    </span>

                    <div className="flex gap-2 flex-wrap">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-accent px-3 py-1 font-mono text-xs text-primary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            </Container>
<Container>
            <div
                className="prose-blog"
                dangerouslySetInnerHTML={{
                    __html: post.html,
                }}
            />
</Container>
        </article>

    );
}

export default BlogPostPage;
