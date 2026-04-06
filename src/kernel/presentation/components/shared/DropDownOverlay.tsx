import type {MyComponentProps} from "../types.ts";

function DropDownOverlay({children}:MyComponentProps) {
    return (
        <div className="absolute top-8 right-0 w-48 h-full bg-black/50" >{children}</div>
    );
}

export default DropDownOverlay;
