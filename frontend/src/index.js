import React from "react";
import ReactDOM from "react-dom/client"; // import from 'react-dom/client'
import AppWrapper from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")); // create a root
root.render(
    <React.StrictMode>
        <AppWrapper />
    </React.StrictMode>
);
