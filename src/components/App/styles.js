import { css } from "emotion";

export const containerCSSClass = css`
    margin: 2rem;
    color: #111;
`;

export const containerLoadingCSSClass = css`
    cursor: wait;
`;

export const titleCSSClass = css`
    text-decoration: underline;
`;

export const descriptionCSSClass = css`
    margin-top: 2rem;
    max-width: 55rem;
`;

export const fileInputCSSClass = css`
    margin-top: -1rem;
    margin-bottom: 1rem;
`;

export const filePathCSSClass = css`
    font-family: monospace;
    padding: 1rem;

    background-color: #222;
    color: #FFF;
`;

export const fileDownloadCSSClass = css`
    font-weight: bold;
    color: #111;
`;

export const firstDownloadCSSClass = css`
    :hover {
        text-decoration: underline;
        color: #000;
    }
`;

export const characterListCSSClass = css`
    margin: .75rem;
`;

export const githubLogoCSSClass = css`
    margin-left: 0.35rem;
    width: 2.25rem;
    height: 2.25rem;
`;
