import type {MyComponentProps} from "../types.ts";

function Container({children}:MyComponentProps) {
    return (
        <div
            className="backdrop-blur-xl bg-black/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl shadow-lg p-6 w-full">
            {children}
        </div>
    );
}

export default Container;
