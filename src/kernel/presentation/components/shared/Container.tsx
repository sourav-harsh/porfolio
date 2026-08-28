import type {MyComponentProps} from "../types.ts";

function Container({children,classes}:MyComponentProps) {
    return (
        <div className={'dark:shadow-[0_0_60px_-12px_var(--color-glow)] shadow-[0_0_60px_-15px_#FFD758] backdrop-blur-sm  bg-black/10 dark:bg-gray-900/30 border border-white/20 dark:border-white/10 rounded-2xl p-6 w-full h-max '+(classes?" "+classes:"")}>
            {children}
        </div>
    );
}

export default Container;
