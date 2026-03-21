import {createContext} from "react";
import type {AppContextType} from "../presentation";

export const AppContext = createContext<AppContextType | null>(null);
