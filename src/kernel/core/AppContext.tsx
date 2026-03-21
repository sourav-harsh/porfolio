import {createContext} from "react";
import type {AppContextType} from "../presentation";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const AppContext = createContext<AppContextType >();
