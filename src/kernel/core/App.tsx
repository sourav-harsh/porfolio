import {BrowserRouter, Route, Routes} from "react-router-dom";
import '../../assets/App.css'
import {useEffect, useState} from "react";
import NotFound from "../../pages/404.tsx";
import Homepage from "../../pages/Homepage.tsx";
import {AppContext as AppContext1} from "./AppContext.tsx";
import { Analytics } from '@vercel/analytics/react';


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
        <>
            <AppContext1 value={{theme, switchTheme}}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </AppContext1>
            <Analytics/>
        </>
    )
}


export default App
