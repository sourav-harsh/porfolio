import { BrowserRouter, Route, Routes } from "react-router-dom";
import '../../assets/App.css'
import {createContext, useEffect, useState} from "react";
import NotFound from "../../pages/404.tsx";
import Homepage from "../../pages/Homepage.tsx";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

function App() {
    const savedTheme = localStorage.getItem('theme')
    const [theme, setTheme] = useState(savedTheme || 'dark')

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");

        localStorage.setItem("theme", theme);
    }, [theme]);

    const switchTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <AppContext.Provider value={{ theme, switchTheme }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    )
}


export default App
