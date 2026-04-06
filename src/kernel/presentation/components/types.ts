import type {ReactNode} from "react";

export type ProjectProps = {
    title: string;
    description: string;
    technologies: string;
    link: string;
    github: string;
};

export type ToggleThemeProps = {
    switchTheme: () => void;
};

export type MyComponentProps = {
    children: ReactNode;
    title?:string;
    switchTheme?: () => void;
    classes?: string;
};
