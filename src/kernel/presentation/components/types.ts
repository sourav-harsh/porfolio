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
