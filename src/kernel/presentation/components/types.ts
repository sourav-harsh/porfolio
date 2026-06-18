import type {ReactNode} from "react";

export type ProjectProps = {
    title: string;
    description: string;
    technologies: string;
    link: string;
    github: string;
    isDemoDisabled:boolean;
    isRepoDisabled:boolean;
};

export type ToggleThemeProps = {
    switchTheme: () => void;
    theme?: string;
};

export type MyComponentProps = {
    children: ReactNode;
    title?:string;
    switchTheme?: () => void;
    classes?: string;
};
